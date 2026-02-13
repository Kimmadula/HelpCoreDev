import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UsersIndex() {
    return (
        <AuthenticatedLayout header="Users">
            <Head title="Users" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    Users management coming soon.
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
