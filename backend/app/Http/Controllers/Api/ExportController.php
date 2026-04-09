<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function carsCsv(): StreamedResponse
    {
        $cars = Car::with(['expenses', 'options'])->latest()->get();

        return response()->streamDownload(function () use ($cars) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Reference',
                'Marque',
                'Modele',
                'Annee',
                'Prix vente',
                'Prix achat',
                'Total frais',
                'Investissement total',
                'Marge estimee',
                'Statut',
                'Publication',
            ], ';');

            foreach ($cars as $car) {
                fputcsv($handle, [
                    $car->id,
                    $car->reference,
                    $car->brand,
                    $car->model,
                    $car->year,
                    $car->price,
                    $car->purchase_price,
                    $car->total_expenses,
                    $car->total_investment,
                    $car->estimated_margin,
                    $car->status,
                    $car->publication_status,
                ], ';');
            }

            fclose($handle);
        }, 'autoline24-voitures.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function carExpensesCsv(string $carId): StreamedResponse
    {
        $car = Car::with('expenses')->findOrFail($carId);

        return response()->streamDownload(function () use ($car) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Voiture',
                'Categorie',
                'Type',
                'Montant',
                'Date',
                'Description',
            ], ';');

            foreach ($car->expenses()->latest('expense_date')->get() as $expense) {
                fputcsv($handle, [
                    trim($car->brand . ' ' . $car->model),
                    $expense->category,
                    $expense->expense_type,
                    $expense->amount,
                    optional($expense->expense_date)->format('Y-m-d'),
                    $expense->description,
                ], ';');
            }

            fclose($handle);
        }, "autoline24-voiture-{$car->id}-frais.csv", [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
