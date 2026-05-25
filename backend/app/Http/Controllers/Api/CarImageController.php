<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CarImageController extends Controller
{
    public function index(string $carId): JsonResponse
    {
        $car = Car::with('images')->findOrFail($carId);

        return response()->json([
            'car_id' => $car->id,
            'images' => $car->images,
        ]);
    }

    public function store(Request $request, string $carId): JsonResponse
    {
        $car = Car::findOrFail($carId);

        $validated = $request->validate([
            'image'      => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=5000,max_height=5000'],
            'is_main'    => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $path = $request->file('image')->store('cars', 'public');

        $requestedMain = (bool) ($validated['is_main'] ?? false);
        $sortOrder = $validated['sort_order'] ?? 0;

        $image = DB::transaction(function () use ($car, $path, $requestedMain, $sortOrder) {
            $isFirst = $car->images()->count() === 0;
            $isMain  = $requestedMain || $isFirst;

            if ($isMain) {
                $car->images()->update(['is_main' => false]);
            }

            return $car->images()->create([
                'image_path' => $path,
                'is_main'    => $isMain,
                'sort_order' => $sortOrder,
            ]);
        });

        return response()->json([
            'message' => 'Image ajoutée avec succès.',
            'image'   => $image,
        ], 201);
    }

    public function setMain(string $id): JsonResponse
    {
        $image = CarImage::findOrFail($id);
        $car   = $image->car;

        DB::transaction(function () use ($car, $image) {
            $car->images()->update(['is_main' => false]);
            $image->update(['is_main' => true]);
        });

        return response()->json([
            'message' => 'Image principale mise à jour avec succès.',
            'image'   => $image->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $image   = CarImage::findOrFail($id);
        $car     = $image->car;
        $wasMain = $image->is_main;

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        if ($wasMain) {
            $newMain = $car->images()->orderBy('sort_order')->first();
            $newMain?->update(['is_main' => true]);
        }

        return response()->json(['message' => 'Image supprimée avec succès.']);
    }
}
