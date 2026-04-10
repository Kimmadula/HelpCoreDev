import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useToast } from '@/Contexts/ToastContext';

export default function UsersIndex() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);

    // Form
    const [editingUser, setEditingUser] = useState(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const fetchUsersAndRoles = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                axios.get('/api/admin/users'),
                axios.get('/api/admin/roles')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            if (rolesRes.data.length > 0 && !role) {
                setRole(rolesRes.data[0].name);
            }
        } catch (error) {
            toast.error("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setName("");
        setEmail("");
        setPassword("");
        setRole(roles.length > 0 ? roles[0].name : "");
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (u) => {
        setEditingUser(u);
        setName(u.name);
        setEmail(u.email);
        setPassword("");
        setRole(u.roles && u.roles.length > 0 ? u.roles[0].name : (roles.length > 0 ? roles[0].name : ""));
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const data = { name, email, role };
        if (password) {
            data.password = password;
        }

        try {
            if (editingUser) {
                await axios.put(`/api/admin/users/${editingUser.id}`, data);
                toast.success("User updated successfully.");
            } else {
                await axios.post('/api/admin/users', data);
                toast.success("User created successfully.");
            }
            setShowModal(false);
            fetchUsersAndRoles();
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error("An error occurred preserving the user.");
            }
        }
    };

    const confirmDelete = async () => {
        if (!deletingUser) return;
        try {
            await axios.delete(`/api/admin/users/${deletingUser.id}`);
            toast.success("User deleted successfully.");
            setDeletingUser(null);
            fetchUsersAndRoles();
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error(error.response.data.message || "You don't have permission to do this.");
            } else {
                toast.error("Failed to delete user.");
            }
            setDeletingUser(null);
        }
    };

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="Users" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Registered Staff</h3>
                    </div>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add User
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {u.roles && u.roles.length > 0 ? u.roles[0].name : "No Role"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEdit(u)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeletingUser(u)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h3 className="text-lg flex items-center gap-2 font-bold mb-4">
                            {editingUser ? "Edit User" : "Add New User"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {editingUser ? "Change Password (optional)" : "Password"}
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!editingUser}
                                />
                                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                                {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role[0]}</p>}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all"
                                >
                                    {editingUser ? "Update User" : "Create User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                onConfirm={confirmDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deletingUser?.name}? They will lose access to the system.`}
                confirmText="Delete User"
            />
        </AuthenticatedLayout>
    );
}
