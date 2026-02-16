<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_products()
    {
        $user = User::factory()->create();
        
        Product::factory()->count(3)->create();

        $response = $this->actingAs($user)->getJson('/api/admin/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'is_published', 'created_at', 'updated_at']
                ]
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_product()
    {
        $user = User::factory()->create();

        $data = [
            'name' => 'New Product',
            'is_published' => true,
        ];

        $response = $this->actingAs($user)->postJson('/api/admin/products', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'New Product']);

        $this->assertDatabaseHas('products', ['name' => 'New Product']);
    }

    public function test_admin_can_update_product()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $data = [
            'name' => 'Updated Product',
            'slug' => 'updated-product',
            'is_published' => false,
        ];

        $response = $this->actingAs($user)->putJson("/api/admin/products/{$product->id}", $data);

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Updated Product']);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Updated Product']);
    }
}
