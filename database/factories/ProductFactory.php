<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'slug' => $this->faker->slug(),
            'is_published' => $this->faker->boolean(),
        ];
    }
}
