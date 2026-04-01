<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Dilindungi middleware admin
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'nullable|boolean',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            // Array validation for tiers
            'priceTiers'                   => 'nullable|array',
            'priceTiers.*.id'              => 'nullable',
            'priceTiers.*.min_qty'         => 'required_with:priceTiers|integer|min:1',
            'priceTiers.*.max_qty'         => 'required_with:priceTiers|integer|min:1|gte:priceTiers.*.min_qty',
            'priceTiers.*.price'           => 'required_with:priceTiers|numeric|min:0',

            // Array validation for materials
            'materials'                    => 'nullable|array',
            'materials.*.id'               => 'nullable',
            'materials.*.name'             => 'required_with:materials|string|max:255',
            'materials.*.additional_price' => 'required_with:materials|numeric|min:0',

            // Array validation for print methods
            'printMethods'                         => 'nullable|array',
            'printMethods.*.id'                    => 'nullable',
            'printMethods.*.name'                  => 'required_with:printMethods|string|max:255',
            'printMethods.*.additional_price'      => 'required_with:printMethods|numeric|min:0',
        ];
    }
    
    /**
     * Custom message for validation
     */
    public function messages(): array
    {
        return [
            'priceTiers.*.max_qty.gte' => 'Batas maksimal Qty harus lebih besar atau sama dengan batas minimal Qty.',
        ];
    }
}
