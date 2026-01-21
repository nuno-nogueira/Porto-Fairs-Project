import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Login() {

    const {login} = useAuth();
    const router = useRouter();
    const navigation = useNavigation();

    //malta isto é para esconder aquela barra
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        try {

            await login(email, password);
            router.replace("/profile");
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message ?? "Oh, no... Login failed.";
            Alert.alert("Error", String(errorMessage));
        };
    };

    return (
        
        <View style={styles.container}>
            
            <Image style={styles.logo} source={require('@/assets/images/logo/logo-name.png')}/>
            <Image style={styles.marketStall} source={require('@/assets/images/auth/market-stall.png')}/>
            <Text style={styles.title}>Iniciar sessão</Text>

            <Text style={styles.subtitle}>Email</Text>
            <TextInput
                placeholder="Escreve o teu email"
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <Text style={styles.subtitle}>Palavra-passe</Text>
            <TextInput
                placeholder="Escreve a tua palavra-passe"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Iniciar Sessão</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/signup')}>
                <Text style={styles.link}>Criar conta</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    
    container: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center', backgroundColor: "#fff" },
    logo: {  width: "60%", height: "10%", resizeMode: 'contain', marginTop: -80 },
    marketStall: {  width:  "100%", height:  "15%", resizeMode: 'contain'},
    title: { fontSize: 32, fontWeight: "bold", marginTop: 30, marginBottom: 30 },
    subtitle: { alignSelf: 'flex-start', marginBottom: 10, fontSize: 16, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12, fontSize:16, width:"100%" },
    button: { backgroundColor: '#c23727ff', padding: 14, borderRadius: 8, alignItems: 'center', width:"100%", marginTop: 30 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize:16 },
    link: { marginTop: 25, textAlign: 'center', color: '#c23727ff', fontSize:16 },

});


