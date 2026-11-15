import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {

    const {login} = useAuth();
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
            <View style={styles.passwordContainer}>
                <TextInput placeholder="Escreve a tua palavra-passe" style={styles.passwordInput} secureTextEntry={!showPassword} value={password} onChangeText={setPassword}/>

                <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#888"
                    />
                </Pressable>
            </View>

            <View style={styles.wrappedButtons} >
                <Pressable style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Iniciar Sessão</Text>
                </Pressable>

                <Pressable style={styles.signupButton}  onPress={() => router.push('/signup')}>
                    <Text style={styles.signupText}>Criar conta</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center', backgroundColor: "#fff" },
    logo: {  width: '45%', height: '5%', marginTop: 20 },
    marketStall: { height:  "15%", width: '60%', resizeMode: 'contain'},
    title: { fontSize: 32, fontWeight: "bold", marginTop: 10, marginBottom: 30 },
    subtitle: { alignSelf: 'flex-start', marginBottom: 10, fontSize: 16, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12, fontSize:16, width:"100%" },
    passwordContainer: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, width: '100%'},
    passwordInput: {flex: 1, padding: 12, fontSize: 16,},
    eyeButton: {paddingHorizontal: 12, paddingVertical: 10},
    loginButton: { backgroundColor: '#c23727ff', padding: 14, borderRadius: 8, alignItems: 'center', width:"100%", marginTop: 30 },
    loginButtonText: { color: '#fff', fontWeight: '600', fontSize:16 },
    signupButton: { borderWidth: 1, borderColor: '#c23727ff', borderRadius: 6,padding: 14,  width:"100%" },
    signupText: { textAlign: 'center', color: '#c23727ff', fontSize:16 },
    wrappedButtons: { flexDirection: 'column', justifyContent: 'center', gap: 10, alignItems: 'center', width: "100%" },

});


