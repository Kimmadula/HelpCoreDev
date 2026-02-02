<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subsection extends Model
{
    protected $fillable = [
        'section_id',
        'title',
        'slug',
        'order_index',
        'is_published',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function blocks()
    {
        return $this->hasMany(PageBlock::class, 'subsection_id')->orderBy('order_index');
    }
}
