<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Http\Requests\Admin\ProductStoreRequest;
use App\Http\Requests\Admin\ProductUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::withCount(['priceTiers', 'materials', 'printMethods'])->latest()->get();

        return Inertia::render('admin/products/Index', ['products' => $products]);
    }

    public function store(ProductStoreRequest $request)
    {
        $validated = $request->validated();

        $validated['slug']      = Str::slug($validated['name']) . '-' . uniqid();
        $validated['is_active'] = $validated['is_active'] ?? true;

        $product = Product::create($validated);

        return redirect()->route('admin.products.edit', $product->id)
            ->with('success', 'Produk dibuat. Silakan atur harga dan varian.');
    }

    public function edit($id)
    {
        $product = Product::with(['priceTiers', 'materials', 'printMethods'])->findOrFail($id);

        return Inertia::render('admin/products/Edit', ['product' => $product]);
    }

    public function update(ProductUpdateRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $updateData = [
                'name'        => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active'   => (bool) $request->input('is_active', 0),
            ];

            // Handle image upload
            if ($request->hasFile('image')) {
                // Delete old image
                if ($product->image_path) {
                    Storage::disk('public')->delete($product->image_path);
                }
                $updateData['image_path'] = $request->file('image')->store('products', 'public');
            }

            $product->update($updateData);

            $this->syncRelations($product->priceTiers(), $validated['priceTiers'] ?? []);
            $this->syncRelations($product->materials(), $validated['materials'] ?? []);
            $this->syncRelations($product->printMethods(), $validated['printMethods'] ?? []);

            DB::commit();

            return back()->with('success', 'Produk berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete image from storage
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        // Manually delete related records (child tables)
        $product->priceTiers()->delete();
        $product->materials()->delete();
        $product->printMethods()->delete();
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Produk dihapus.');
    }

    private function syncRelations($relationMethod, $data)
    {
        $currentIds = collect($data)->pluck('id')->filter()->toArray();
        $relationMethod->whereNotIn('id', $currentIds)->delete();

        foreach ($data as $item) {
            $payload = collect($item)->except(['id', 'product_id'])->toArray();
            if (!empty($item['id'])) {
                $relationMethod->where('id', $item['id'])->update($payload);
            } else {
                $relationMethod->create($payload);
            }
        }
    }
}
