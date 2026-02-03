<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageBlock extends Model
{
    protected $fillable = [
        'subsection_id',
        'type',
        'heading_level',
        'text',
        'image_path',
        'order_index',
        'align',
        'image_width',
        'list_style',
        'list_items',
    ];

    protected $casts = [
        'list_items' => 'array',
    ];


    public function subsection()
    {
        return $this->belongsTo(Subsection::class);
    }

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}
