<?php

use Illuminate\Support\Facades\Route;

// Toutes les routes non-API renvoient l'app React (SPA fallback)
Route::get('/{any}', function () {
    $index = public_path('index.html');
    if (file_exists($index)) {
        return response()->file($index);
    }
    return response('Frontend non buildé. Lance : cd frontend && npm run build', 503);
})->where('any', '.*');
