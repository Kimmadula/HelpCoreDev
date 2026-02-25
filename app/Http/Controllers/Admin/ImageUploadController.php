<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'], // 5MB max, strict types
        ]);

        $file = $request->file('image');
        
        // Generate new filename with .webp extension
        $filename = pathinfo($file->hashName(), PATHINFO_FILENAME) . '.webp';
        $path = 'help-images/' . $filename;

        // Read and process the image
        $manager = new ImageManager(new Driver());
        $image = $manager->read($file);
        
        // Encode to WebP format with 80% quality
        $encoded = $image->toWebp(80);

        // Store the optimized WebP image
        Storage::disk('public')->put($path, (string) $encoded);

        return response()->json([
            'path' => '/storage/' . $path,
        ], 201);
    }
}
