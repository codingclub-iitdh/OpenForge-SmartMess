// ----------------------------------------------------------------------

export default function Table(theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1, 1),
        },
        head: {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.background.neutral,
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
        },
      },
    },
  };
}
