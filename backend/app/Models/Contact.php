<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'car_id',
        'name',
        'email',
        'phone',
        'subject',
        'message',
    ];

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }
}
