<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::with(['images', 'expenses', 'options'])
            ->latest()
            ->get();

        return response()->json($cars);
    }

    public function publicIndex(Request $request)
    {
        $query = Car::with(['images', 'mainImage', 'options'])
            ->where('publication_status', 'published');

        if ($request->filled('brand')) {
            $query->where('brand', 'like', '%' . $request->brand . '%');
        }

        if ($request->filled('model')) {
            $query->where('model', 'like', '%' . $request->model . '%');
        }

        if ($request->filled('fuel_type')) {
            $query->where('fuel_type', $request->fuel_type);
        }

        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('min_year')) {
            $query->where('year', '>=', $request->min_year);
        }

        if ($request->filled('max_year')) {
            $query->where('year', '<=', $request->max_year);
        }

        if ($request->filled('max_mileage')) {
            $query->where('mileage', '<=', $request->max_mileage);
        }

        if ($request->filled('option_ids')) {
            $optionIds = $request->option_ids;

            foreach ($optionIds as $optionId) {
                $query->whereHas('options', function ($q) use ($optionId) {
                    $q->where('options.id', $optionId);
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%$search%")
                    ->orWhere('model', 'like', "%$search%");
            });
        }

        if ($request->filled('sort')) {
            match ($request->sort) {
                'price_asc' => $query->orderBy('price', 'asc'),
                'price_desc' => $query->orderBy('price', 'desc'),
                'year_desc' => $query->orderBy('year', 'desc'),
                'mileage_asc' => $query->orderBy('mileage', 'asc'),
                default => $query->latest(),
            };
        } else {
            $query->latest();
        }

        $perPage = $request->get('per_page', 10);

        return response()->json(
            $query->paginate($perPage)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'version' => ['nullable', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'mileage' => ['required', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'fuel_type' => ['required', 'string', 'max:100'],
            'transmission' => ['required', 'string', 'max:100'],
            'power_hp' => ['nullable', 'integer', 'min:0'],
            'fiscal_power' => ['nullable', 'integer', 'min:0'],
            'engine_size' => ['nullable', 'integer', 'min:0'],
            'doors' => ['nullable', 'integer', 'min:1', 'max:10'],
            'seats' => ['nullable', 'integer', 'min:1', 'max:20'],
            'color' => ['nullable', 'string', 'max:100'],
            'body_type' => ['nullable', 'string', 'max:100'],
            'first_registration_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:available,reserved,sold'],
            'publication_status' => ['required', 'in:draft,published'],
            'featured' => ['nullable', 'boolean'],
            'reference' => ['nullable', 'string', 'max:255', 'unique:cars,reference'],
        ]);

        $car = Car::create($validated);

        return response()->json([
            'message' => 'Voiture créée avec succès.',
            'car' => $car
        ], 201);
    }

    public function show(string $id)
    {
        $car = Car::with(['images', 'expenses', 'options'])->findOrFail($id);

        return response()->json($car);
    }

    public function publicShow(string $id)
    {
        $car = Car::with(['images', 'options'])
            ->where('publication_status', 'published')
            ->findOrFail($id);

        return response()->json($car);
    }

    public function update(Request $request, string $id)
    {
        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'version' => ['nullable', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1900', 'max:' . date('Y')],
            'mileage' => ['required', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'fuel_type' => ['required', 'string', 'max:100'],
            'transmission' => ['required', 'string', 'max:100'],
            'power_hp' => ['nullable', 'integer', 'min:0'],
            'fiscal_power' => ['nullable', 'integer', 'min:0'],
            'engine_size' => ['nullable', 'integer', 'min:0'],
            'doors' => ['nullable', 'integer', 'min:1', 'max:10'],
            'seats' => ['nullable', 'integer', 'min:1', 'max:20'],
            'color' => ['nullable', 'string', 'max:100'],
            'body_type' => ['nullable', 'string', 'max:100'],
            'first_registration_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:available,reserved,sold'],
            'publication_status' => ['required', 'in:draft,published'],
            'featured' => ['nullable', 'boolean'],
            'reference' => ['nullable', 'string', 'max:255', 'unique:cars,reference,' . $car->id],
        ]);

        $car->update($validated);

        return response()->json([
            'message' => 'Voiture mise à jour avec succès.',
            'car' => $car
        ]);
    }

    public function destroy(string $id)
    {
        $car = Car::findOrFail($id);
        $car->delete();

        return response()->json([
            'message' => 'Voiture supprimée avec succès.'
        ]);
    }

    public function brands()
    {
        $brands = Car::query()
            ->where('publication_status', 'published')
            ->select('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        return response()->json($brands);
    }
}
