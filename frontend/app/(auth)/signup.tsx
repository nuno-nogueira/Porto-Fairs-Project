import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, Pressable, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useNavigation } from 'expo-router/react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSetup, SetupRole } from '@/context/SetupContext';

export default function Signup() {
    
    const { register } = useAuth();
    const router = useRouter();
    const navigation = useNavigation();
    
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const {currentLocation, selectedRole, sellerDescription} = useSetup();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<SetupRole>(selectedRole ?? 'buyer'); // buyer by default

    const handleSignup = async () => {
        
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Preenche todos os campos obrigatórios');
            return;
        }

        if (role !== 'buyer' && role !== 'seller') {
            Alert.alert("Erro", 'Selecione um tipo de conta');
            return;
        }
        
        console.log("test 1 passed")
        try {
          await register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,

            ...(role === 'buyer' && currentLocation.trim() ? { current_location: currentLocation.trim()} : {}),
            ...(role === 'seller' && sellerDescription.trim() ? { description: sellerDescription.trim()} : {})
          });

          Alert.alert(
            'Conta criada!',
            'A sua conta foi criada com sucesso. Autentique-se para entrar na sua conta!'
          );
          router.replace('/login');
        } catch (err: any) {
          Alert.alert(
            'Erro',
            err.response?.data?.error || err.response?.data?.msg || 'Não foi possível criar conta, tente outra vez!'
          )
        }
    };
    
    return (
        <ScrollView 
        style={styles.container}
        contentContainerStyle={{alignItems: 'center', 'justifyContent': 'center', marginTop: 80}}
        keyboardShouldPersistTaps='handled'>

            <Image style={styles.logo} source={require('@/assets/images/logo/logo-name.png')}/>
            <Image style={styles.marketStall} source={require('@/assets/images/auth/market-stall.png')}/>
            <Text style={styles.title}>Criar conta</Text>

            <Text style={styles.subtitle}>Nome</Text>
            <TextInput placeholder="Escreve o teu nome" style={styles.input} value={name} onChangeText={setName} />
            <Text style={styles.subtitle}>Email</Text>
            <TextInput placeholder="Escreve o teu email" style={styles.input} value={email} onChangeText={setEmail} />

            <Text style={styles.subtitle}>Tipo de Conta</Text>
            <View style={styles.roleContainer}>
                <Pressable
                  style={[styles.roleOption,
                      role === 'buyer' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('buyer')}>
                    <Text style={[styles.roleText, role === 'buyer' && styles.roleTextSelected]} >Comprador</Text>
                </Pressable>

                 <Pressable
                  style={[styles.roleOption,
                      role === 'seller' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('seller')}>
                    <Text style={[styles.roleText, role === 'seller' && styles.roleTextSelected]} >Vendedor</Text>
                </Pressable>
            </View>

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

            <View style={styles.wrappedButtons}>
                <Pressable style={styles.button} onPress={handleSignup}>
                    <Text style={styles.buttonText}>Criar conta</Text>
                </Pressable>
                <Pressable style={styles.linkButton} onPress={() => router.replace('/')}>
                    <Text style={styles.link}>Talvez mais tarde</Text>
                </Pressable>
            </View>
            
            <Text style={styles.bottom}>Já tens uma conta? <Text style={styles.link} onPress={() => router.replace('/login')}>Inicia sessão</Text></Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: { width: "40%", height: "8%", resizeMode: 'contain'},
  marketStall: { height: "10%", width: "50%", resizeMode: "contain"},
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 5 },
  subtitle: {
    alignSelf: "flex-start",
    marginBottom: 6,
    fontSize: 16,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 16,
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    width: "100%",
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeButton: { paddingHorizontal: 12, paddingVertical: 10 },
  button: {
    backgroundColor: "#c23727ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { textAlign: "center", color: "#c23727ff", fontSize: 16 },
  linkButton: {
    borderWidth: 1,
    borderColor: "#c23727ff",
    borderRadius: 6,
    padding: 14,
    width: "100%",
  },
  wrappedButtons: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  bottom: { 
    alignSelf: "center", 
    fontSize: 16, 
    marginTop: 14 
    },
  roleContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginBottom: 12,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  roleOptionSelected: {
    borderColor: "#c23727ff",
    backgroundColor: "#fff5f2",
  },

  roleText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },

  roleTextSelected: {
    color: "#c23727ff",
    fontWeight: "bold",
  }
});