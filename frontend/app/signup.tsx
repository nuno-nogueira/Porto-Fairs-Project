import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function Signup() {
    
    const { register } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();
    
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        
        try {
            await register(name, email, password);
            Alert.alert("Account created.", "Login to enter your account.");
            router.replace('/login');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Signup failed. Please, try again.');
        }
    };
    
    return (
        <View style={styles.container}>

            <Image style={styles.logo} source={require('@/assets/images/logo/logo-name.png')}/>
            <Image style={styles.marketStall} source={require('@/assets/images/auth/market-stall.png')}/>
            <Text style={styles.title}>Criar conta</Text>

            <Text style={styles.subtitle}>Nome</Text>
            <TextInput placeholder="Escreve o teu nome" style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.subtitle}>Email</Text>
            <TextInput placeholder="Escreve o teu email" style={styles.input} value={email} onChangeText={setEmail} />
            <Text style={styles.subtitle}>Palavra-passe</Text>
            <TextInput placeholder="Escreve a tua palavra-passe" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

            <View style={styles.wrappedButtons}>
                <Pressable style={styles.linkButton} onPress={() => router.replace('/menu')}>
                    <Text style={styles.link}>Talvez mais tarde</Text>
                </Pressable>
                 <Pressable style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Criar conta</Text>
                </Pressable>
            </View>
            
            <Text style={styles.bottom}>Já tens uma conta? <Text style={styles.link} onPress={() => router.replace('/login')}>Inicia sessão</Text></Text>
     
        </View>
    );
}

const styles = StyleSheet.create({
    
    container: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center', backgroundColor: "#fff" },
    logo: {  width: "60%", height: "10%", resizeMode: 'contain', marginTop: 10 },
    marketStall: {  width:  "100%", height:  "15%", resizeMode: 'contain'},
    title: { fontSize: 32, fontWeight: "bold", marginTop: 30, marginBottom: 10 },
    subtitle: { alignSelf: 'flex-start', marginBottom: 10, fontSize: 16, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 12, fontSize:16, width:"100%" },
    button: { backgroundColor: '#c23727ff', padding: 14, borderRadius: 8, alignItems: 'center', width:"55%", marginRight: -25 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize:16 },
    link: { textAlign: 'center', color: '#c23727ff', fontSize:16 },
    linkButton: { borderWidth: 1, borderColor: '#c23727ff', borderRadius: 6,padding: 14,  width:"55%", marginLeft: -25 },
    wrappedButtons: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, alignItems: 'center', width: "100%" },
    bottom: { alignSelf: 'center', marginBottom: 10, fontSize: 16, marginTop: 10 }
});