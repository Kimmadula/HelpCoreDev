<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageBlock extends Model
{
    protected $fillable = [
        'page_id',       
        'subsection_id',  
        'type',
        'heading_level',
        'text',
        'image_path',
        'order_index'
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
