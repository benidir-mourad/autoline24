<?php

use App\Http\Controllers\Api\AppSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\CarExpenseController;
use App\Http\Controllers\Api\CarImageController;
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
Route::post('/admin/login', [AuthController::class, 'login']);
Route::post('/admin/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/admin/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/options', [OptionController::class, 'index']);
Route::get('/brands', [CarController::class, 'brands']);
Route::get('/settings/contact', [AppSettingController::class, 'publicContact']);

/*
|--------------------------------------------------------------------------
| Routes protégées admin
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
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
