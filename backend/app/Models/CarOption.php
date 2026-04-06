<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CarOption extends Model
{
    protected $fillable = [
        'car_id',
        'name',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
