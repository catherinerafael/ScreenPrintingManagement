<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Require auth and specific admin email
        if (! $request->user() || $request->user()->email !== 'admin@sablon.com') {
            abort(403, 'Akses ditolak. Halaman ini khusus Administrator.');
        }

        return $next($request);
    }
}
