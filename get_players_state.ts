const events = [
  {
    type: 'substitution',
    details: { playerIn: { _id: '1' }, playerOut: { _id: '2' } },
  },
];
const playedPlayers = new Set();
events.forEach((e) => {
  if (e.type === 'substitution') {
    playedPlayers.add(e.details.playerIn._id);
    playedPlayers.add(e.details.playerOut._id);
  }
});
console.log(playedPlayers);
