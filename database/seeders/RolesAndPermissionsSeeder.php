<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage products']);
        Permission::create(['name' => 'manage content']);
        Permission::create(['name' => 'publish content']);
        Permission::create(['name' => 'delete content']);

        // Create Roles and assign created permissions
        $superAdmin = Role::create(['name' => 'Super Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $manager = Role::create(['name' => 'Manager']);
        $manager->givePermissionTo(['manage products', 'manage content', 'publish content', 'delete content']);

        $writer = Role::create(['name' => 'Writer']);
        $writer->givePermissionTo(['manage content']);

        // Create test users and assign roles
        $adminUser = User::factory()->create([
            'name' => 'Super Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $adminUser->assignRole('Super Admin');

        $managerUser = User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
        ]);
        $managerUser->assignRole('Manager');

        $writerUser = User::factory()->create([
            'name' => 'Writer User',
            'email' => 'writer@example.com',
            'password' => Hash::make('password'),
        ]);
        $writerUser->assignRole('Writer');
    }
}
