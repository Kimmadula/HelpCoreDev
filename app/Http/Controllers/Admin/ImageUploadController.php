<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB max, strict types
        ]);

        $path = $request->file('image')->store('help-images', 'public');

        return response()->json([
            'path' => '/storage/' . $path,
        ], 201);
    }
}
