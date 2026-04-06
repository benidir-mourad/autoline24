<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Car extends Model
{
    protected $fillable = [
        'brand',
        'model',
        'version',
        'year',
        'mileage',
        'price',
        'purchase_price',
        'fuel_type',
        'transmission',
        'power_hp',
        'fiscal_power',
        'engine_size',
        'doors',
        'seats',
        'color',
        'body_type',
        'first_registration_date',
        'description',
        'status',
        'publication_status',
        'featured',
        'reference',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'price' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'first_registration_date' => 'date',
    ];

    protected $appends = [
        'total_expenses',
        'total_investment',
        'estimated_margin',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order')->orderByDesc('is_main');
    }

    public function mainImage()
    {
        return $this->hasOne(CarImage::class)->where('is_main', true);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(CarExpense::class);
    }

    public function options(): BelongsToMany
    {
        return $this->belongsToMany(Option::class)->orderBy('name');
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function getTotalExpensesAttribute(): float
    {
        return (float) $this->expenses()->sum('amount');
    }

    public function getTotalInvestmentAttribute(): float
    {
        return (float) ($this->purchase_price ?? 0) + $this->total_expenses;
    }

    public function getEstimatedMarginAttribute(): float
    {
        return (float) $this->price - $this->total_investment;
    }
}
