export const AlphabetizeList = (list) =>{
    list.sort(function(a,b){return a.name.localeCompare(b.name)});
}

export const isEmpty = (str) => {
  if (!str) return false;
  return str.replace(/^\s+|\s+$/g, "").length === 0;
};