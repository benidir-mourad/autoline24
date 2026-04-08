<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CarExpenseController;
use App\Http\Controllers\Api\CarImageController;
use App\Http\Controllers\Api\OptionController;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::get('/cars', [CarController::class, 'publicIndex']);
Route::get('/cars/{id}', [CarController::class, 'publicShow']);
Route::post('/admin/login', [AuthController::class, 'login']);
Route::get('/options', [OptionController::class, 'index']);
Route::get('/brands', [CarController::class, 'brands']);

/*
|--------------------------------------------------------------------------
| Routes protégées admin
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/cars', [CarController::class, 'index']);
    Route::post('/cars', [CarController::class, 'store']);
    Route::get('/cars/{id}', [CarController::class, 'show']);
    Route::put('/cars/{id}', [CarController::class, 'update']);
    Route::delete('/cars/{id}', [CarController::class, 'destroy']);

    Route::get('/cars/{carId}/expenses', [CarExpenseController::class, 'index']);
    Route::post('/cars/{carId}/expenses', [CarExpenseController::class, 'store']);

    Route::get('/expenses/{id}', [CarExpenseController::class, 'show']);
    Route::put('/expenses/{id}', [CarExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [CarExpenseController::class, 'destroy']);

    Route::get('/cars/{carId}/images', [CarImageController::class, 'index']);
    Route::post('/cars/{carId}/images', [CarImageController::class, 'store']);
    Route::patch('/images/{id}/set-main', [CarImageController::class, 'setMain']);
    Route::delete('/images/{id}', [CarImageController::class, 'destroy']);

    Route::get('/options', [OptionController::class, 'index']);
    Route::post('/options', [OptionController::class, 'store']);

    Route::get('/cars/{carId}/options', [OptionController::class, 'carOptions']);
    Route::put('/cars/{carId}/options', [OptionController::class, 'assignToCar']);
    Route::delete('/cars/{carId}/options/{optionId}', [OptionController::class, 'detachFromCar']);

});
