import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Keyboard,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSetup } from '@/context/SetupContext';
import categories from './data/categories.json';
import { categoryIcons } from './(tabs)/categoryIcons';

export default function SetupScreen() {
    const { 
        currentLocation, setCurrentLocation,
        selectedCategories, toggleCategory,
        selectedRole, setSelectedRole
    } = useSetup();

    const router = useRouter();
    const [step, setStep] = useState(1);
    const [categorySearch, setCategorySearch] = useState('');

    const handleNext = () => {
       Keyboard.dismiss();
        setStep(2);
    }

    const handleSkip = () => {
        Keyboard.dismiss();
        setCurrentLocation('');
        setStep(2);
    };

    const handleFinish = () => {
        if (!selectedRole) {
            Alert.alert(
                'Tipo de Perfil',
                'Seleciona se pretendes comprar ou vender!'
            )

            return;
        };

        Keyboard.dismiss();
        router.replace('/signup');
    }

    const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
    );

    return (
        <>
            <Stack.Screen
                options={{headerShown: false}}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {step === 1 ? (
                    <>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}  
                            keyboardShouldPersistTaps='handled'>
                            
                            {/* Progress Indicators */}
                            <View style={styles.progressContainer}>
                                {[1, 2, 3].map((item) => (
                                    <View
                                    key={item}
                                    style={[
                                        styles.progressBar,
                                        item === 1 && styles.activeProgress,
                                    ]}/>
                                ))}
                            </View>

                            <View style={styles.headingContainer}>
                                <Text style={styles.title} >Onde Estás?</Text>

                                <Text style={styles.description}>
                                    Usamos a tua localização para te mostrar feiras, eventos e oportunidades perto de ti.
                                </Text>
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Localização</Text>
                                
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Introduz a tua localização'
                                        placeholderTextColor='#B8B8B8'
                                        value={currentLocation}
                                        onChangeText={setCurrentLocation}
                                        returnKeyType='done'/>

                                    <Pressable style={styles.locationIcon}>
                                        <Ionicons
                                            name="location-sharp"
                                            size={20}
                                            color="#A5A5A5" />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.illustration}>
                                <Image 
                                style={styles.firstTabIllustration}
                                source={require('@/assets/images/onboarding-setup-1.jpg')} />
                            </View>

                            {/* CTAs */}
                            <View style={styles.buttonsContainer}>
                                <Pressable
                                    onPress={handleSkip}
                                    style={styles.skipButton}>
                                    <Text style={styles.skipText}>Ignorar</Text>
                                </Pressable>

                                <Pressable
                                    onPress={handleNext}
                                    style={styles.nextButton}>
                                    <Text style={styles.nextText}>Seguinte</Text>
                                </Pressable>
                            </View>

                        </ScrollView>
                    </>    
                ) : step === 2 ? (
                    <>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}  
                            keyboardShouldPersistTaps='handled'>

                            <View style={styles.progressContainer}>
                                {[1, 2, 3].map((item) => (
                                    <View
                                        key={item}
                                        style={[styles.progressBar, item <= 2 && styles.activeProgress]}/>
                                ))}
                            </View>

                            <View style={styles.headingContainer}>
                                <Text style={styles.title}>O que mais combina contigo?</Text>

                                <Text style={styles.description}> Isto ajuda-nos a mostrar-te produtos, bancas e conteúdos mais relevantes.</Text>
                            </View>

                            {/* Category Search */}
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>Categoria</Text>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Pesquisa por uma categoria'
                                        placeholderTextColor="#B8B8B8"
                                        value={categorySearch}
                                        onChangeText={setCategorySearch}/>

                                    <View style={styles.locationIcon}>
                                        <Ionicons
                                            name="search-outline"
                                            size={20}
                                            color="#A5A5A5"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Category Selection */}
                            <View style={styles.categoryContainer}>
                                {filteredCategories.map((category) => {
                                    const isSelected = selectedCategories.includes(category.name);

                                    return (
                                        <Pressable
                                            key={category.name}
                                            onPress={() => toggleCategory(category.name)}
                                            style={[
                                                styles.categoryChip,
                                                isSelected && styles.categoryChipSelected
                                            ]}>
                                                <Image
                                                    source={categoryIcons[category.iconKey]}
                                                    style={styles.categoryIcon}
                                                    resizeMode='contain'
                                                />

                                                <Text
                                                style={[
                                                    styles.categoryChipText,
                                                    isSelected && styles.categoryChipTextSelected
                                                ]}
                                                >{category.name}</Text>

                                        </Pressable>
                                    )
                                })}
                            </View>

                            {filteredCategories.length === 0 && (
                                <Text style={styles.emptyCategories}>Não foi encontrada nenhuma categoria.</Text>
                            )}

                            {/* CTAs */}
                            <View style={styles.buttonsContainer}>
                                <Pressable
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setStep(3)
                                }}
                                style={styles.skipButton}>
                                    <Text style={styles.skipText}>Ignorar</Text>
                                </Pressable>

                                <Pressable
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setStep(3);
                                }}
                                style={styles.nextButton}>
                                    <Text style={styles.nextText}>Seguinte</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <>
                        <ScrollView contentContainerStyle={styles.step3ScrollContent}>
                            <View style={styles.progressContainer}>
                                {[1, 2, 3].map((item) => (
                                    <View
                                        key={item}
                                        style={[styles.progressBar, styles.activeProgress]}/>
                                ))}
                            </View>

                            <View style={styles.headingContainer}>
                                <Text style={styles.title}>Que tipo de perfil queres ter?</Text>

                                <Text style={styles.description}>Escolhe o que melhor representa aquilo que procuras.</Text>
                            </View>

                            {/* Account Type Cards */}
                            <View style={styles.roleCardsContainer}>

                                {/* Buyer Card */}
                                <Pressable
                                    onPress={() => setSelectedRole('buyer')}
                                    style={[styles.roleCard, 
                                        selectedRole === 'buyer' && styles.roleCardSelected
                                    ]}>
                                        <Text style={styles.roleEmoji}>🛒</Text>

                                        <Text style={[styles.roleTitle,
                                            selectedRole === 'buyer' && styles.roleTitleSelected
                                        ]}>
                                            Quero Comprar
                                        </Text>

                                        <Text style={styles.roleDescription}>Descobrir feiras, produtos e bancas perto de mim.</Text>
                                </Pressable>

                                {/* Seller Card */}
                                <Pressable
                                    onPress={() => setSelectedRole('seller')}
                                    style={[styles.roleCard,
                                        selectedRole === 'seller' && styles.roleCardSelected
                                    ]}>
                                        <Text style={styles.roleEmoji}>     🧑‍🌾</Text>

                                        <Text
                                            style={[
                                                styles.roleTitle,
                                                selectedRole === 'seller' && styles.roleTitleSelected
                                            ]}>
                                                Quero Vender
                                        </Text>

                                        <Text style={styles.roleDescription}>
                                            Divulgar os meus produtos e vender nas feiras.
                                        </Text>
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={handleFinish}
                                disabled={!selectedRole}
                                style={[
                                    styles.finishButton,
                                    !selectedRole && styles.finishButtonDisabled
                                ]}>
                                    <Text style={styles.finishButtonText}>Terminar</Text>

                            </Pressable>
                        </ScrollView>
                    </>
                )}
            </KeyboardAvoidingView>
        </>
    )
}

const styles = StyleSheet.create({

    // Step 1
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 48,
    },

    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 48,
    },

    progressBar: {
        flex: 1,
        height: 4,
        borderRadius: 4,
        backgroundColor: '#F7B9AF',
    },

    activeProgress: {
        backgroundColor: '#C94D27',
    },

    headingContainer: {
        marginBottom: 54,
    },

    title: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#211D1D',
    },

    description: {
        fontSize: 16,
        color: '#858080',
        lineHeight: 24,
        marginTop: 12,
    },

    inputSection: {
        width: '100%',
    },

    label: {
        fontSize: 16,
        color: '#737373',
        marginBottom: 8,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DADADA',
        borderRadius: 11,
        height: 44,
        width: '100%',
    },

    input: {
        flex: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333333',
    },

    locationIcon: {
        paddingHorizontal: 13,
        paddingVertical: 10,
    },

    illustration: {
        flex: 1,
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },

    firstTabIllustration: {
        height: 230,
        width: '55%',
        justifyContent: 'center'
    },

    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 28,
        paddingBottom: 30,
        paddingTop: 80,
    },

    skipButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#D34E24',
        borderRadius: 8
    },

    skipText: {
        color: '#D34E24',
        fontSize: 16,
        fontWeight: '500',
    },

    nextButton: {
        backgroundColor: '#C94D27',
        borderRadius: 6,
        paddingHorizontal: 40,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },

    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // Step 2

    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 20,
        paddingHorizontal: 6,
    },

    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1.5,
        borderColor: '#D3D6DB',
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
    },

    categoryChipSelected: {
        borderColor: '#C64F23',
    },

    categoryIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },

    
    emptyCategories: {
        textAlign: 'center',
        color: '#858080',
        marginTop: 20,
    },

    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#542B1C',
    },

    categoryChipTextSelected: {
        color: '#C64F23',
    },

    // Step 3
    step3ScrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 30,
        paddingBottom: 30,
    },

    roleCardsContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 18,
        paddingVertical: 10,
    },

    roleCard: {
        width: '100%',
        minHeight: 175,
        borderWidth: 1.5,
        borderColor: '#DADADA',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },

    roleCardSelected: {
        borderColor: '#C64F23',
        backgroundColor: '#FFF7F3',
    },

    roleEmoji: {
        fontSize: 42,
        marginBottom: 3,
        margin: 'center'
    },

    roleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#211D1D',
    },

    roleTitleSelected: {
        color: '#C64F23',
    },

    roleDescription: {
        fontSize: 14,
        color: '#858080',
        textAlign: 'center',
        lineHeight: 20,
    },

    finishButton: {
        backgroundColor: '#C94D27',
        borderRadius: 7,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    finishButtonDisabled: {
        opacity: 0.45,
    },

    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    }
});