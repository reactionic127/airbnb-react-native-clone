import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useQuery} from '@apollo/client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {GET_APARTMENTS_QUERY} from '../graphql';
import {defaultFilterOption} from '../constants';
import {ApartmentType} from '../types';
import {numberWithCommas} from '../utils';
import {Header} from '../components/Header';
import {PriceFilterModal} from '../components/PriceFilterModal';
import {RoomFilterModal} from '../components/RoomFilterModal';
import {styles} from './styles';

export function ApartmentsScreen({navigation}: any) {
  const [filterOptions, setFilterOptions] = useState(defaultFilterOption);
  const [buildings, setBuildings] = useState<ApartmentType[]>([]);
  const [priceFilterModalVisible, setPriceFilterModalVisible] = useState(false);
  const [roomFilterModalVisible, setRoomFilterModalVisible] = useState(false);

  const {data, loading, error, fetchMore} = useQuery(GET_APARTMENTS_QUERY, {
    variables: {
      offset: 0,
      limit: 12,
      priceGte: filterOptions.price.startVal,
      priceLte: filterOptions.price.endVal,
      pricePerSqmGte: filterOptions.pricePerSqm.startVal,
      pricePerSqmLte: filterOptions.pricePerSqm.endVal,
      sqmGte: filterOptions.sqm.startVal,
      sqmLte: filterOptions.sqm.endVal,
      numberOfBedroom: filterOptions.numberOfBedrooms.value,
      numberOfBathroom: filterOptions.numberOfBathrooms.value,
    },
  });

  useEffect(() => {
    if (data && !loading && fetchMore) {
      const {allApartments: apartments} = data;
      setBuildings(apartments);
    }
  }, [data, loading, fetchMore]);

  const handleFilterOptions = (options: any) => {
    setFilterOptions(options);
  };

  if (error) {
    return (
      <View style={styles.emptyView}>
        <Text style={styles.emptyText}>Something went wrong</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header {...navigation} />
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          removeClippedSubviews
          contentContainerStyle={styles.scrollView}
          showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.filterItemView}
            onPress={() => setPriceFilterModalVisible(true)}>
            <Text style={styles.filterText}>Precio</Text>
            <Ionicons
              name="caret-down-sharp"
              size={15}
              style={styles.downIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterItemView}
            onPress={() => setRoomFilterModalVisible(true)}>
            <Text style={styles.filterText}>#de habitacion</Text>
            <Ionicons
              name="caret-down-sharp"
              size={15}
              style={styles.downIcon}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
      <FlatList
        testID="apartment-list"
        data={loading ? [] : buildings || []}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.listItem} testID="list-item">
            <ImageBackground
              source={{uri: item.picture}}
              style={styles.photoBG}
              imageStyle={styles.photo}>
              <View style={styles.priceView}>
                <Text style={styles.price}>
                  {numberWithCommas(item.price)} €
                </Text>
                <View style={styles.flexView}>
                  <Text style={styles.sqmText}>
                    {numberWithCommas(item.pricePerSqm)} €/m²
                  </Text>
                </View>
              </View>
            </ImageBackground>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.infoView}>
                <View style={styles.itemView}>
                  <Ionicons name="md-bed-outline" size={15} color="gray" />
                  <Text style={styles.infoText}>
                    {item.numberOfBedrooms} habs.
                  </Text>
                </View>
                <View style={styles.itemCenterView}>
                  <MaterialCommunityIcons
                    name="shower"
                    size={15}
                    color="gray"
                  />
                  <Text style={styles.infoText}>
                    {item.numberOfBathrooms} baño
                  </Text>
                </View>
                <View style={styles.itemRightView}>
                  <MaterialCommunityIcons
                    name="square-off-outline"
                    size={15}
                    color="gray"
                  />
                  <Text style={styles.infoText}>{item.sqm} m²</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        onEndReachedThreshold={0.9}
        ListEmptyComponent={() => (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>There is no data to displayed</Text>
          </View>
        )}
        onEndReached={() => {
          const currentLength = data.allApartments.length;
          fetchMore({
            variables: {
              offset: currentLength,
              limit: 12,
            },
            updateQuery: (prev: any, {fetchMoreResult}: any) => {
              if (!fetchMoreResult) {
                return prev;
              }
              return Object.assign({}, prev, {
                allApartments: [
                  ...prev.allApartments,
                  ...fetchMoreResult.allApartments,
                ],
              });
            },
          });
        }}
      />
      <PriceFilterModal
        testId={'price-filter-modal'}
        visible={priceFilterModalVisible}
        setVisible={setPriceFilterModalVisible}
        filterOptions={filterOptions}
        handleFilterOptions={handleFilterOptions}
      />
      <RoomFilterModal
        testId={'room-filter-modal'}
        visible={roomFilterModalVisible}
        setVisible={setRoomFilterModalVisible}
        filterOptions={filterOptions}
        handleFilterOptions={handleFilterOptions}
      />
    </SafeAreaView>
  );
}
