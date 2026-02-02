<?php

namespace App\Models;
use App\Models\Subsection;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = ['product_id', 'title', 'order_index', 'is_published'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function subsections()
    {
        return $this->hasMany(Subsection::class)->orderBy('order_index');
    }


    public function pages()
    {
        return $this->hasMany(Page::class)->orderBy('order_index');
    }
}
