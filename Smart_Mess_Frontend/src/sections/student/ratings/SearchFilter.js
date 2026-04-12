import React from 'react';
import PropTypes from 'prop-types';
import { Paper, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchFilter = ({ filterString, setFilterString }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        padding: '8px 16px',
        margin: '5px 20px',
        borderRadius: 8,
        border: '1px solid rgba(108,27,133,0.1)',
        bgcolor: '#fff',
        transition: 'border-color 0.2s',
        '&:focus-within': {
          borderColor: '#6c1b85'
        }
      }}
    >
      <TextField
        fullWidth
        placeholder="Search for a specific food item..."
        variant="standard"
        InputProps={{
          disableUnderline: true,
          startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 2 }} />
        }}
        value={filterString}
        onChange={(e) => setFilterString(e.target.value)}
      />
    </Paper>
  );
};

SearchFilter.propTypes = {
  filterString: PropTypes.string.isRequired,
  setFilterString: PropTypes.func.isRequired,
};

export default SearchFilter;
