<?php

use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', function () {
    $cars = \App\Models\Car::where('publication_status', 'published')
        ->select('id', 'updated_at')
        ->latest()
        ->get();

    $base = rtrim(config('app.url'), '/');

    $xml  = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    $xml .= "<url><loc>{$base}/cars</loc><changefreq>daily</changefreq><priority>1.0</priority></url>";
    $xml .= "<url><loc>{$base}/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>";

    foreach ($cars as $car) {
        $xml .= '<url>';
        $xml .= "<loc>{$base}/cars/{$car->id}</loc>";
        $xml .= "<lastmod>{$car->updated_at->toDateString()}</lastmod>";
        $xml .= '<changefreq>weekly</changefreq>';
        $xml .= '<priority>0.8</priority>';
        $xml .= '</url>';
    }

    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml');
});

// Toutes les routes non-API renvoient l'app React (SPA fallback)
Route::get('/{any}', function () {
    $index = public_path('index.html');
    if (file_exists($index)) {
        return response()->file($index);
    }
    return response('Frontend non buildé. Lance : cd frontend && npm run build', 503);
})->where('any', '.*');
