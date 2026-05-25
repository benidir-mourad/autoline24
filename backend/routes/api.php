<?php

use App\Http\Controllers\Api\AppSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\CarExpenseController;
use App\Http\Controllers\Api\CarImageController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\OptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques
|--------------------------------------------------------------------------
*/

Route::get('/cars', [CarController::class, 'publicIndex']);
Route::get('/cars/{id}', [CarController::class, 'publicShow']);
Route::get('/options', [OptionController::class, 'index']);
Route::get('/brands', [CarController::class, 'brands']);
Route::get('/settings/contact', [AppSettingController::class, 'publicContact']);

Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/admin/recover', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/admin/renew', [AuthController::class, 'resetPassword']);
Route::post('/contact', [ContactController::class, 'send'])->middleware('throttle:10,1');

/*
|--------------------------------------------------------------------------
| Routes protégées admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/change-email', [AuthController::class, 'changeEmail']);

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
    Route::delete('/options/{id}', [OptionController::class, 'destroy']);
    Route::get('/cars/{carId}/options', [OptionController::class, 'carOptions']);
    Route::put('/cars/{carId}/options', [OptionController::class, 'assignToCar']);
    Route::delete('/cars/{carId}/options/{optionId}', [OptionController::class, 'detachFromCar']);

    Route::get('/settings/contact', [AppSettingController::class, 'adminContact']);
    Route::put('/settings/contact', [AppSettingController::class, 'updateContact']);

    Route::get('/settings/mail', [AppSettingController::class, 'adminMail']);
    Route::put('/settings/mail', [AppSettingController::class, 'updateMail']);

    Route::get('/exports/cars', [ExportController::class, 'carsCsv']);
    Route::get('/exports/cars/{carId}/expenses', [ExportController::class, 'carExpensesCsv']);
});
