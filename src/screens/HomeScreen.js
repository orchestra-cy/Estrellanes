import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { authLogout } from '../app/action';
import { ROUTES } from '../utils';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function HomeScreen() {
  const navigate = useNavigation();
  const dispatch = useDispatch();

  const quickLinks = [
    { label: 'Book Visit', icon: 'calendar-check' },
    { label: 'Find Clinic', icon: 'map-marker' },
    { label: 'Shop Care', icon: 'basket' },
    { label: 'Tele-Dental', icon: 'video' },
    { label: 'Offers', icon: 'tag' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* GREETING SECTION */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Good morning,</Text>
          <Text style={styles.userName}>Clint</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#64748B" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search services, clinics, or products"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={styles.scanButton} activeOpacity={0.7}>
            <Icon name="qrcode-scan" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* QUICK LINKS GRID */}
        <View style={styles.quickLinksGrid}>
          {quickLinks.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickLinkItem}
              activeOpacity={0.7}
            >
              <View style={styles.quickLinkIcon}>
                <Icon name={item.icon} size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickLinkLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FEATURED SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
        >
          {/* Card 1 */}
          <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={styles.cardImageContainer}>
              <View style={[styles.cardGradient, { backgroundColor: '#E3F2FD' }]}>
                {/* Fallback to 'emoticon-outline' if 'tooth' is too new for your RN version */}
                <Icon name="tooth" size={48} color="#007AFF" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Whitening Special</Text>
              <Text style={styles.cardDescription}>
                Professional teeth whitening at 30% off. Includes take-home kit.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPromo}>Limited time offer</Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={styles.cardImageContainer}>
              <View style={[styles.cardGradient, { backgroundColor: '#FCE4EC' }]}>
                <Icon name="calendar-check" size={48} color="#007AFF" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Checkup Reminder</Text>
              <Text style={styles.cardDescription}>
                Your next cleaning is in 2 weeks. Book now to secure your time.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPromo}>Schedule now</Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <View style={styles.cardImageContainer}>
              <View style={[styles.cardGradient, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="shield-check" size={48} color="#007AFF" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Insurance Verified</Text>
              <Text style={styles.cardDescription}>
                Your coverage is active. View benefits and remaining balance.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardPromo}>Check coverage</Text>
                <Icon name="arrow-right" size={18} color="#007AFF" />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* APPOINTMENT CARD */}
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <View style={styles.appointmentTitleContainer}>
              <Icon name="calendar" size={22} color="#007AFF" />
              <Text style={styles.appointmentTitle}>Upcoming Appointment</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.rescheduleText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.appointmentDetails}>
            <View style={styles.appointmentTimeContainer}>
              <Text style={styles.appointmentDay}>Tomorrow</Text>
              <Text style={styles.appointmentDate}>• 10:30 AM</Text>
            </View>
            <Text style={styles.appointmentType}>Regular Checkup & Cleaning</Text>
            <Text style={styles.appointmentLocation}>with Dr. James Wilson • Main Clinic</Text>
          </View>
          
          <TouchableOpacity style={styles.prepButton} activeOpacity={0.7}>
            <Text style={styles.prepButtonText}>Prepare for visit</Text>
            <Icon name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* RECOMMENDED PRODUCTS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Shop All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.productsContainer}
          contentContainerStyle={styles.productsContent}
        >
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.productCard} activeOpacity={0.8}>
              <View style={styles.productImagePlaceholder}>
                {/* Fallback to 'flash' if 'toothbrush-electric' doesn't show */}
                <Icon name="toothbrush-electric" size={32} color="#007AFF" />
              </View>
              <Text style={styles.productName}>Electric Toothbrush</Text>
              <Text style={styles.productPrice}>$89.99</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
                <Icon name="cart-plus" size={18} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

      

      </ScrollView>
    </SafeAreaView>
  );
}

// Keep your exact StyleSheet here! (No changes needed to styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', marginTop: 10 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  greetingContainer: { paddingHorizontal: 20, marginTop: 16 },
  greetingText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 20, borderRadius: 16, paddingHorizontal: 16, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#0F172A', marginLeft: 12, marginRight: 8 },
  scanButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  quickLinksGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 24 },
  quickLinkItem: { alignItems: 'center' },
  quickLinkIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  quickLinkLabel: { fontSize: 12, color: '#475569', marginTop: 8, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 32, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  seeAllText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  cardsContainer: { marginLeft: 20 },
  cardsContent: { paddingRight: 20 },
  card: { width: 280, backgroundColor: '#FFFFFF', borderRadius: 24, marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  cardImageContainer: { padding: 16 },
  cardGradient: { height: 120, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 16, paddingTop: 0 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  cardDescription: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPromo: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  appointmentCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 24, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appointmentTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appointmentTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  rescheduleText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  appointmentDetails: { marginBottom: 20 },
  appointmentTimeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  appointmentDay: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  appointmentDate: { fontSize: 15, color: '#64748B', marginLeft: 4 },
  appointmentType: { fontSize: 15, color: '#0F172A', fontWeight: '500', marginBottom: 4 },
  appointmentLocation: { fontSize: 14, color: '#64748B' },
  prepButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  prepButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  productsContainer: { marginLeft: 20 },
  productsContent: { paddingRight: 20 },
  productCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  productImagePlaceholder: { height: 100, backgroundColor: '#F1F5F9', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#007AFF', marginBottom: 8 },
  addButton: { backgroundColor: '#007AFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' },
  fabContainer: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  fab: { flexDirection: 'row', backgroundColor: '#0F172A', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 40, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  fabText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  devLogoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 20, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  devLogoutText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
});