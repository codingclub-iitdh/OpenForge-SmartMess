import { useCallback, useEffect, useState } from 'react';
import { Container, useMediaQuery } from '@mui/material';
import { find, uniqBy } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { allItems, filterTimeTable } from '../../utils/filterTimeTable';
import { getFoodReviews } from '../../utils/apis';
import FoodRatingCard from '../../sections/student/ratings/FoodRatingCard';
import SearchFilter from '../../sections/student/ratings/SearchFilter';

const uniqueIDs = (itemsArray) => {
  const uniqId = new Set();
  itemsArray.forEach((item) => {
    uniqId.add(item?._id);
  });
  return uniqId;
};

const MobileRatings = ({ timetable, ratings }) => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const hidden = searchParams.has('hidden');
  const value = searchParams.has('value') ? decodeURIComponent(searchParams.get('value')) : null;

  const allFoodItems = allItems(filterTimeTable(timetable));
  const uniqFoodItems = uniqBy(allFoodItems, (ele) => ele?._id);
  
  const [filterString, setFilterString] = useState('');
  const [ratedFoodItems, setRatedFoodItems] = useState([]);
  const isLargeMobile = useMediaQuery('(max-width:480px)');

  const getRatedFoodItems = useCallback(async () => {
    const res = await getFoodReviews();
    setRatedFoodItems(res);
  }, []);

  useEffect(() => {
    getRatedFoodItems();
    if (hidden && value) {
      setFilterString(value);
    }
  }, [getRatedFoodItems, hidden, value]);

  return (
    <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} disableGutters>
      {!hidden && <SearchFilter filterString={filterString} setFilterString={setFilterString} />}
      
      <div style={{ margin: '10px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: isLargeMobile ? 'center' : 'flex-start', alignItems: 'baseline' }}>
        {uniqFoodItems.map((foodItem) => {
          const ratingMatch = find(ratings, { FoodItem: foodItem?._id });
          const alreadyRated = find(ratedFoodItems, (item) => item?.foodId?._id === foodItem?._id);

          const shouldShow = () => {
             const name = foodItem?.Name?.toLowerCase() || '';
             const filter = filterString.toLowerCase();
             if (filter === '') return true;
             if (hidden) return name === filter;
             return name.includes(filter);
          };

          if (shouldShow()) {
            return (
              <FoodRatingCard
                key={foodItem?._id}
                item={foodItem}
                ratings={ratingMatch}
                setRatedFoodItems={setRatedFoodItems}
                ratedItem={alreadyRated}
                isReturn={hidden}
                navigate={navigate}
              />
            );
          }
          return null;
        })}
      </div>
    </Container>
  );
};

export default MobileRatings;
