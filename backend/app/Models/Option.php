<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Option extends Model
{
    protected $fillable = [
        'name',
        'slug',
    ];

    public function cars(): BelongsToMany
    {
        return $this->belongsToMany(Car::class);
    }
}
