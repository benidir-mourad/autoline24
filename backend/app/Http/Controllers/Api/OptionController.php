<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OptionController extends Controller
{
    public function index()
    {
        return response()->json(
            Option::orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:options,name'],
        ]);

        $option = Option::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return response()->json([
            'message' => 'Option creee avec succes.',
            'option' => $option,
        ], 201);
    }

    public function destroy(string $id)
    {
        $option = Option::findOrFail($id);
        $option->delete();

        return response()->json([
            'message' => 'Option supprimee avec succes.',
        ]);
    }

    public function assignToCar(Request $request, string $carId)
    {
        $car = Car::findOrFail($carId);

        $validated = $request->validate([
            'option_ids' => ['required', 'array'],
            'option_ids.*' => ['integer', 'exists:options,id'],
        ]);

        $car->options()->sync($validated['option_ids']);

        return response()->json([
            'message' => 'Options de la voiture mises a jour avec succes.',
            'car' => $car->load('options'),
        ]);
    }

    public function carOptions(string $carId)
    {
        $car = Car::with('options')->findOrFail($carId);

        return response()->json([
            'car_id' => $car->id,
            'options' => $car->options,
        ]);
    }

    public function detachFromCar(string $carId, string $optionId)
    {
        $car = Car::findOrFail($carId);
        $car->options()->detach($optionId);

        return response()->json([
            'message' => 'Option retiree de la voiture avec succes.',
        ]);
    }
}
