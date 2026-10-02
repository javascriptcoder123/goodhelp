import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, RadioButton } from 'react-native-paper';
import { collection, query, where, getDocs } from "firebase/firestore";
import { TouchableOpacity, StyleSheet, View, FlatList, Image } from 'react-native';

import { firestore } from '../../firebase.js';
import moment from "moment";

import Button from '../components/Button';

export default function AcceptClothes(props) {
  const navigation = useNavigation();
  const [LIST, setLIST] = useState([])

  const setClothes = async function(){
    const querySnapshot = await getDocs(collection(firestore, "clothing"));
    const newList = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setLIST(newList);
  }

  useEffect(()=> {
    setClothes()
  },[])

  const empty = () => {
    return (
      <View style={styles.empty}>
      <Text></Text>
      </View>
    )
  }

  // Older or partially-written listings may be missing dateCreated, so
  // don't assume it's a Firestore Timestamp.
  const toDate = (date) => {
    if (!date) return null;
    if (date.seconds != null) {
      return new Date(date.seconds * 1000 + (date.nanoseconds || 0) / 1000000);
    }
    if (typeof date.toDate === 'function') return date.toDate();
    if (date instanceof Date) return date;
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

  const Item = ({title, quantity, picture, dateCreated}) => {
    const timeLabel = getTime(dateCreated);
    const hasPicture = typeof picture === 'string' && picture.trim().length > 0;
    return (
      <View style={styles.item}>
        {hasPicture ? (
          <Image source={{uri: picture}} style={styles.icon} />
        ) : (
          <View style={styles.icon} />
        )}
        <Text style={styles.title}>{title || 'Untitled'}</Text>
        {timeLabel ? <Text style={styles.date}>{timeLabel}</Text> : null}
        <Text style={styles.quantity}>{quantity}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={LIST}
        ListEmptyComponent={empty}
        renderItem={({item}) => <Item title={item.title} quantity={item.quantity} picture={item.picture} dateCreated={item.dateCreated} />}
        keyExtractor={(item, index) => item.id ?? String(index)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "flex-start",
  },
  icon: {
    width: 36,
    height: 38,
  },
  forgot: {
    fontSize: 13,
    color: "red",
  },
  link: {
    fontWeight: 'bold',
  },
  item: {
    flexDirection: "row",
    backgroundColor: '#d3d3d3',
    padding: 15,
    height: 53,
    marginVertical: 4,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    paddingLeft: 15,
    textTransform: 'capitalize'
  },
  date: {
    fontSize: 13,
    paddingLeft: 8,
  },
  quantity: {
    fontSize: 20,
    marginLeft: 'auto'
  },
  form: {
    alignItems: 'center',
    padding: 0,
    marginLeft: 20,
    marginRight: 120
  },
  default: {
    backgroundColor: 'blue',
    width: 300
  },
  container: {
      flex: 1,
      backgroundColor: 'white',
  },
})