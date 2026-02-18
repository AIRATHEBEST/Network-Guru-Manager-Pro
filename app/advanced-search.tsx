import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface SearchResult {
  id: string;
  name: string;
  type: string;
  network: string;
}

const AdvancedSearchScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<string[]>([]);

  const handleSearch = async () => {
    // TODO: Implement actual cross-network device search using tRPC API
    console.log('Searching for:', searchText, 'with filters:', filters);
    // Mock results for now
    setSearchResults([
      { id: '1', name: 'Device A', type: 'Router', network: 'Office Network' },
      { id: '2', name: 'Device B', type: 'Server', network: 'Home Network' },
      { id: '3', name: 'Device C', type: 'Camera', network: 'Office Network' },
    ]);
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultDetails}>{item.type} - {item.network}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search devices, networks, etc."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity style={styles.filterButton} onPress={() => console.log('Open filter options')}>
        <Text style={styles.filterButtonText}>Add Filters</Text>
      </TouchableOpacity>

      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.noResultsText}>No results found. Try a different search.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 14,
    color: '#555',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});

export default AdvancedSearchScreen;
