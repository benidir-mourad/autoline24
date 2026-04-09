<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarExpense;
use Illuminate\Http\Request;

class CarExpenseController extends Controller
{
    public function index(string $carId)
    {
        $car = Car::findOrFail($carId);

        $expenses = $car->expenses()
            ->latest('expense_date')
            ->latest('id')
            ->get();

        return response()->json([
            'car_id' => $car->id,
            'total_expenses' => $expenses->sum('amount'),
            'expenses' => $expenses,
        ]);
    }

    public function store(Request $request, string $carId)
    {
        $car = Car::findOrFail($carId);

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'expense_type' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $expense = $car->expenses()->create($validated);

        return response()->json([
            'message' => 'Frais ajouté avec succès.',
            'expense' => $expense,
        ], 201);
    }

    public function show(string $id)
    {
        $expense = CarExpense::with('car')->findOrFail($id);

        return response()->json($expense);
    }

    public function update(Request $request, string $id)
    {
        $expense = CarExpense::findOrFail($id);

        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'expense_type' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $expense->update($validated);

        return response()->json([
            'message' => 'Frais mis à jour avec succès.',
            'expense' => $expense,
        ]);
    }

    public function destroy(string $id)
    {
        $expense = CarExpense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'message' => 'Frais supprimé avec succès.',
        ]);
    }
}
