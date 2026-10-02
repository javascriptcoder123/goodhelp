import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, RadioButton } from 'react-native-paper';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';

import { firestore } from '../../firebase.js';
import moment from 'moment';

import Button from '../components/Button';

export default function AcceptAnimals(props) {
  const navigation = useNavigation();

  const setAnimals = async function () {
    const querySnapshot = await getDocs(collection(firestore, 'animals'));
    const newList = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setLIST(newList);
  };

  const [LIST, setLIST] = useState([]);

  useEffect(() => {
    setAnimals();
  }, []);

  const toDate = (date) => {
    if (!date) return null;
    if (date.seconds != null) {
      return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
    }
    if (typeof date.toDate === 'function') {
      return date.toDate();
    }
    if (date instanceof Date) {
      return date;
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const getTime = (date) => {
    const dates = toDate(date);
    if (!dates) return '';

    let result = moment(dates).fromNow();
    const now = moment();
    const days = now.diff(dates, 'days');
    const weeks = now.diff(dates, 'weeks');
    if (days >= 7) {
      if (days <= 13) {
        result = `a week ago`;
      } else if (days > 13 && days <= 25) {
        result = `${weeks} weeks ago`;
      }
    }
    return result;
  };

  const empty = () => {
    return (
      <View style={styles.empty}>
        <Text></Text>
      </View>
    );
  };

  const goToListing = function (groupID, documentId) {
    if (groupID == null || groupID === '') {
      if (!documentId) return;

      navigation.navigate('Donation Screen', {
        collectionName: 'animals',
        documentId,
      });
      return;
    }

    navigation.navigate('Donation Screen', {
      collectionName: 'animals',
      groupID,
    });
  };

  const Item = ({ title, picture, dateCreated, groupID, documentId }) => {
    const timeLabel = getTime(dateCreated);
    const hasPicture = typeof picture === 'string' && picture.trim().length > 0;

    return (
      <TouchableOpacity
        onPress={() => {
          goToListing(groupID, documentId);
        }}
      >
        <View style={styles.item}>
          {hasPicture ? (
            <Image source={{ uri: picture }} style={styles.icon} />
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
          <View style={styles.details}>
            <Text style={styles.title} numberOfLines={1}>
              {title || 'Untitled'}
            </Text>
            {timeLabel ? (
              <Text style={styles.date}>Posted {timeLabel}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={LIST}
        scrollEnabled={true}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <Item
            title={item.title}
            picture={item.picture}
            groupID={item.groupID}
            documentId={item.id}
            // Older listings were saved without dateCreated; fall back to
            // the listing's start date so every row still shows a date.
            dateCreated={item.dateCreated ?? item.startDate}
          />
        )}
        // renderItem={({ item }) => console.group(item)}
        keyExtractor={(item, index) =>
          item.id ?? `${item.groupID}-${item.title}-${index}`
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'flex-start',
  },
  icon: {
    width: 36,
    height: 38,
  },
  iconPlaceholder: {
    width: 36,
    height: 38,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  forgot: {
    fontSize: 13,
    color: 'red',
  },
  link: {
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#d3d3d3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 53,
    marginVertical: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  details: {
    flex: 1,
    paddingLeft: 15,
  },
  title: {
    fontSize: 20,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  quantity: {
    fontSize: 20,
    marginLeft: 'auto',
  },
  form: {
    alignItems: 'center',
    padding: 0,
    marginLeft: 20,
    marginRight: 120,
  },
  default: {
    backgroundColor: 'blue',
    width: 300,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
