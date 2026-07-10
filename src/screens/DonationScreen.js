import React, { createRef, useRef, useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Text, TextInput, RadioButton } from 'react-native-paper';
import { TouchableOpacity, StyleSheet, View, ScrollView, Switch, Image, Dimensions, Linking } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Entypo } from '@expo/vector-icons'; 
import { Feather } from '@expo/vector-icons'; 

import { firestore } from '../../firebase.js';
import moment from "moment";

import Button from '../components/Button';

export default function DonationScreen({route}) {

 	const { collectionName, groupID, documentId } = route.params;
	const [LIST, setLIST] = useState([])

	const getDetails = async function(){
    if (groupID != null && groupID !== '') {
      const q = query(collection(firestore, collectionName), where("groupID", "==", groupID));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id }));
      setLIST(items);
      return;
    }

    if (documentId) {
      const docSnap = await getDoc(doc(firestore, collectionName, documentId));
      if (docSnap.exists()) {
        setLIST([{ ...docSnap.data(), id: docSnap.id }]);
      }
    }
  }

  useEffect(()=> {
    getDetails()
  },[])

  const groupData = LIST[0] ?? {}

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

  const formatDate = (date) => {
    const parsed = toDate(date);
    return parsed ? moment(parsed).format("dddd, MMMM Do YYYY") : '';
  };

  const phoneDetails = function(){
  	return(
  		<TouchableOpacity onPress={() => {Linking.openURL('tel:'+groupData.phoneNumber)}} >
  			<Feather name="phone" size={24} color="black" /> 
  		</TouchableOpacity>
  	)
  }

  const emailDetails = function(){
  	return(
  		<TouchableOpacity onPress={() => {Linking.openURL('mailto:'+groupData.email)}} >
  			<Entypo name="email" size={24} color="black" />
  		</TouchableOpacity>
  	)
  }

  return (
    <ScrollView style={styles.container}>
      {LIST.map((item, index) => {
        const startDateLabel = formatDate(item.startDate);
        const endDateLabel = formatDate(item.endDate);
        return (
          <View key={item.id ?? `${item.title}-${index}`} style={styles.item}>
          	{item.picture ? (
              <Image source={{uri: item.picture}} style={styles.icon}/>
            ) : (
              <View style={styles.iconPlaceholder} />
            )}
            <Text style={styles.title}>{item.title}</Text>
            <View>
            	{item.type ? <Text style={styles.type}>{item.type}</Text> : null}
            	{item.condition ? <Text style={styles.condition}>{item.condition}</Text> : null}
            	{item.quantity ? <Text style={styles.quantity}>{item.quantity}</Text> : null}
              {startDateLabel ? <Text style={styles.start}>{startDateLabel}</Text> : null}
              {endDateLabel ? <Text style={styles.end}>{endDateLabel}</Text> : null}
            </View>
          </View>
        );
      })}
      <View style={styles.contact}>
          {groupData.address ? <Text style={styles.location}>{groupData.address}</Text> : null}
          {groupData.phoneNumber ? phoneDetails() : null}
          {groupData.email ? emailDetails() : null}
      </View>
    </ScrollView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  item: {
    flexDirection: "row",
    backgroundColor: '#d3d3d3',
    padding: 15,
    height: 103,
    marginVertical: 4,
    marginHorizontal: 4,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    paddingLeft: 15,
  },
  quantity: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  type: {
    fontSize: 14,
    marginLeft: 20,
  },
  condition: {
    fontSize: 14,
    marginLeft: 20,
  },
  icon: {
    width: 60,
    height: 65,
  },
  iconPlaceholder: {
    width: 60,
    height: 65,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  contact: {
    alignItems: "center",
    flexDirection: "row",
    paddingTop: 40,
  },
	defaultsave: {
    backgroundColor: 'green',
    width: 300,
    alignItems: "center",
    marginBottom: 100,
  },
});