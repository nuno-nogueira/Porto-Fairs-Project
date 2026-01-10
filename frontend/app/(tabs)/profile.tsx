import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {

    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) {
        router.replace('/login');
        return null;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Olá, {user.name}</Text>

            <Pressable onPress={async () => {
                await logout();
                router.replace('/login');
            }}>
                <Text style={{ color: 'red', marginTop: 20 }}>Logout</Text>
            </Pressable>
        </View>
    );
}
