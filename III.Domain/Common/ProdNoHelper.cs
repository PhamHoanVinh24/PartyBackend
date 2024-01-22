using ESEIM.Models;
using ESEIM.Utils;
using Newtonsoft.Json.Linq;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace III.Domain.Common
{
    public class ProdStrNo : IEquatable<ProdStrNo>
    {
        public bool IsList { get; private set; }
        public int? StartNo { get; private set; }
        public int? EndNo { get; private set; }
        public int? Value { get; private set; }
        public ProdStrNo(string item)
        {
            if (item.Contains(".."))
            {
                string pattern = @"(\d+)\.\.(\d+)";
                RegexOptions options = RegexOptions.Multiline;
                var matches = new List<Match>();
                foreach (Match m in Regex.Matches(item, pattern, options))
                {
                    Console.WriteLine("'{0}' found at index {1}.", m.Value, m.Index);
                    matches.Add(m);
                }
                if (matches.Count < 1)
                {
                    throw new ArgumentException("Pattern not matched");
                }
                var startNo = int.Parse(item.Split("..")[0].Trim());
                var endNo = int.Parse(item.Split("..")[1].Trim());
                if (startNo > endNo)
                {
                    throw new ArgumentException("Start bigger than end");
                }
                IsList = true;
                StartNo = startNo;
                EndNo = endNo;
            }
            else
            {
                var result = -1;
                var isInt = int.TryParse(item.Trim(), out result);
                if (!isInt)
                {
                    throw new ArgumentException("Value is not int");
                }
                IsList = false;
                Value = int.Parse(item.Trim());
            }
        }
        public ProdStrNo(int startNo, int endNo)
        {
            if (startNo != endNo)
            {
                if (startNo > endNo)
                {
                    throw new ArgumentException("Start bigger than end");
                }
                IsList = true;
                StartNo = startNo;
                EndNo = endNo;
            }
            else
            {
                IsList = false;
                Value = startNo;
            }
        }
        public ProdStrNo(int value)
        {
            IsList = false;
            Value = value;
        }
        public bool IsValueInList(int value)
        {
            if (!IsList)
            {
                throw new ArgumentException("This object is not a list");
            }
            return (value >= StartNo) && (value <= EndNo);
        }
        public bool IsObjInList(ProdStrNo obj)
        {
            if (!IsList)
            {
                throw new ArgumentException("This object is not a list");
            }
            if (!obj.IsList)
            {
                throw new ArgumentException("Parameter obj is not a list");
            }
            return (obj.StartNo >= StartNo) && (obj.EndNo <= EndNo);
        }
        public bool IsObjIntersectList(ProdStrNo obj)
        {
            if (!IsList)
            {
                throw new ArgumentException("This object is not a list");
            }
            if (!obj.IsList)
            {
                throw new ArgumentException("Parameter obj is not a list");
            }
            return (obj.StartNo <= EndNo) && (obj.EndNo >= StartNo);
            //(StartA <= EndB) and (EndA >= StartB)
        }
        public ProdStrNo ExtractValueInList(int value)
        {
            if (!IsList)
            {
                throw new ArgumentException("This object is not a list");
            }
            if (!IsValueInList(value))
            {
                throw new ArgumentException("Value not exist in list");
            }
            if (value > StartNo)
            {
                if (value < EndNo)
                {
                    var endNo = EndNo.Value;
                    EndNo = value - 1;
                    return new ProdStrNo(value + 1, endNo);
                }
                else if (EndNo.HasValue)
                {
                    var endNo = EndNo.Value;
                    EndNo = value - 1;
                    return null;
                }
                else
                {
                    throw new ArgumentException("This object is not correct");
                }
            }
            else
            {
                StartNo = value + 1;
                return null;
            }
        }
        public ProdStrNo ExtractObjInList(ProdStrNo obj)
        {
            if (!IsList)
            {
                throw new ArgumentException("This object is not a list");
            }
            if (!IsObjInList(obj))
            {
                throw new ArgumentException("Object not exist in list");
            }
            if (obj.StartNo > StartNo)
            {
                if (obj.EndNo < EndNo)
                {
                    var endNo = EndNo.Value;
                    EndNo = obj.StartNo - 1;
                    return new ProdStrNo(obj.EndNo.Value + 1, endNo);
                }
                else if (EndNo.HasValue)
                {
                    var endNo = EndNo.Value;
                    EndNo = obj.StartNo - 1;
                    return null;
                }
                else
                {
                    throw new ArgumentException("This object is not correct");
                }
            }
            else
            {
                StartNo = obj.EndNo + 1;
                return null;
            }
        }
        public bool ValidateList()
        {
            if (!IsList)
            {
                //throw new ArgumentException("This object is not a list");
                return false;
            }
            if (StartNo == EndNo)
            {
                Console.WriteLine("List have one element, must convert to single value");
                return false;
            }
            return true;
        }
        public void ConvertToSingle()
        {
            //if (!IsList)
            //{
            //    throw new ArgumentException("This object is not a list");
            //}
            if (StartNo != EndNo)
            {
                throw new ArgumentException("Start number do not equal end number");
            }
            IsList = false;
            Value = StartNo;
            StartNo = null;
            EndNo = null;
        }
        public bool IsAdjacent(int value)
        {
            if (IsList)
            {
                return (value == StartNo - 1) || (value == EndNo + 1);
            }
            else
            {
                return (value == Value - 1) || (value == Value + 1);
            }
        }
        public bool IsAdjacent(ProdStrNo obj)
        {
            if (!obj.IsList)
            {
                throw new ArgumentException("Checking object is not a list");
            }
            if (IsList)
            {
                return (obj.EndNo == StartNo - 1) || (obj.StartNo == EndNo + 1);
            }
            else
            {
                return (obj.EndNo == Value - 1) || (obj.StartNo == Value + 1);
            }
        }
        public void Add(int value)
        {
            if (!IsAdjacent(value))
            {
                throw new ArgumentException("This value is not adjacent to this object");
            }
            if (IsList)
            {
                StartNo = (value == StartNo - 1) ? value : StartNo;
                EndNo = (value == EndNo + 1) ? value : EndNo;
            }
            else
            {
                StartNo = (value == Value - 1) ? value : Value;
                EndNo = (value == Value + 1) ? value : Value;
                Value = null;
                IsList = true;
            }
        }
        public void Add(ProdStrNo obj)
        {
            if (!IsAdjacent(obj))
            {
                throw new ArgumentException("Checking object is not adjacent to this object");
            }
            if (IsList)
            {
                StartNo = (obj.EndNo == StartNo - 1) ? obj.StartNo : StartNo;
                EndNo = (obj.StartNo == EndNo + 1) ? obj.EndNo : EndNo;
            }
            else
            {
                StartNo = (obj.EndNo == Value - 1) ? obj.StartNo : Value;
                EndNo = (obj.StartNo == Value + 1) ? obj.EndNo : Value;
                Value = null;
                IsList = true;
            }
        }
        public override string ToString()
        {
            if (IsList)
            {
                return $"{StartNo}..{EndNo}";
            }
            else
            {
                return Value.ToString();
            }
        }
        public int? Order()
        {
            return IsList ? StartNo : Value;
        }
        public bool Equals(ProdStrNo other)
        {
            if (IsList)
            {
                return (other.StartNo == StartNo) && (other.EndNo == EndNo);
            }
            else
            {
                return other.Value == Value;
            }
        }

        public override bool Equals(object obj) => Equals(obj as ProdStrNo);
        public override int GetHashCode()
        {
            if (IsList)
            {
                return (StartNo, EndNo).GetHashCode();
            }
            else
            {
                return Value.GetHashCode();
            }
        }
        public int Count()
        {
            return IsList ? (EndNo.Value - StartNo.Value + 1) : 1;
        }
    }

    public static class ListProdStrNoHelper
    {
        public static bool Include(this List<ProdStrNo> list, int value)
        {
            return list.Any(x => (x.IsList && x.IsValueInList(value)) || (!x.IsList && x.Value == value));
        }
        public static bool Include(this List<ProdStrNo> list, ProdStrNo obj)
        {
            return list.Any(x => (!obj.IsList && obj.Value.HasValue && ((x.IsList && x.IsValueInList(obj.Value.Value)) || (!x.IsList && x.Value == obj.Value.Value)))
            || (obj.IsList && x.IsList && x.IsObjInList(obj)));
        }
        public static void Extract(this List<ProdStrNo> list, int value)
        {
            var obj = list.FirstOrDefault(x => (x.IsList && x.IsValueInList(value)) || (!x.IsList && x.Value == value));
            if (obj != null)
            {
                if (obj.IsList)
                {
                    var newObj = obj.ExtractValueInList(value);
                    if (newObj != null)
                    {
                        if (!newObj.ValidateList() && newObj.Value == null)
                        {
                            newObj.ConvertToSingle();
                        }
                        list.Add(newObj);
                    }
                    if (!obj.ValidateList() && obj.Value == null)
                    {
                        obj.ConvertToSingle();
                    }
                }
                else
                {
                    list.Remove(obj);
                }
            }
            list.Sort((x, y) =>
            {
                if (!x.Order().HasValue || !y.Order().HasValue)
                {
                    throw new Exception();
                }
                return x.Order().Value.CompareTo(y.Order().Value);
            });
        }
        public static void Extract(this List<ProdStrNo> list, ProdStrNo extractingObj)
        {
            var obj = list.FirstOrDefault(x => (!extractingObj.IsList && extractingObj.Value.HasValue && ((x.IsList && x.IsValueInList(extractingObj.Value.Value)) || (!x.IsList && x.Value == extractingObj.Value.Value)))
            || (extractingObj.IsList && x.IsList && x.IsObjInList(extractingObj)));
            if (obj != null)
            {
                if (!extractingObj.IsList && extractingObj.Value.HasValue)
                {
                    list.Extract(extractingObj.Value.Value);
                }
                else if (obj.IsList)
                {
                    var newObj = obj.ExtractObjInList(extractingObj);
                    if (newObj != null)
                    {
                        if (!newObj.ValidateList() && newObj.Value == null)
                        {
                            newObj.ConvertToSingle();
                        }
                        list.Add(newObj);
                    }
                    if (obj.StartNo.HasValue && obj.EndNo.HasValue && obj.StartNo > obj.EndNo)
                    {
                        list.Remove(obj);
                    }
                    else if (!obj.ValidateList() && obj.Value == null)
                    {
                        obj.ConvertToSingle();
                    }
                }
            }
            list.Sort((x, y) =>
            {
                if (!x.Order().HasValue || !y.Order().HasValue)
                {
                    throw new Exception();
                }
                return x.Order().Value.CompareTo(y.Order().Value);
            });
        }
        public static void Extract(this List<ProdStrNo> list, List<ProdStrNo> extractingList)
        {
            extractingList.ForEach(x => list.Extract(x));
        }
        public static void Add(this List<ProdStrNo> list, int value)
        {
            var adjacentObj = list.FirstOrDefault(x => x.IsAdjacent(value));
            if (adjacentObj != null)
            {
                adjacentObj.Add(value);
                var adjacentObjOfObj = list.FirstOrDefault(x => x.IsAdjacent(adjacentObj));
                if (adjacentObjOfObj != null)
                {
                    adjacentObjOfObj.Add(adjacentObj);
                    list.Remove(adjacentObj);
                }
            }
            else
            {
                list.Add(new ProdStrNo(value));
            }
            list.Sort((x, y) =>
            {
                if (!x.Order().HasValue || !y.Order().HasValue)
                {
                    throw new Exception();
                }
                return x.Order().Value.CompareTo(y.Order().Value);
            });
        }

        public static bool ContainsRange(this List<ProdStrNo> a, List<ProdStrNo> b)
        {
            // check every b element, whether in list of an element of a or equal to an element of a
            return b.All(x => (x.IsList && a.Any(y => y.IsList && y.IsObjInList(x))
            || (!x.IsList && a.Any(y => y.IsList && y.IsValueInList(x.Value.HasValue ? x.Value.Value : 0))) || a.Contains(x)));
        }
        public static bool IsIntersect(this List<ProdStrNo> a, List<ProdStrNo> b)
        {
            // check if any b element, whether in list of an element of a or equal to an element of a
            return b.Any(x => (x.IsList && a.Any(y => y.IsList && y.IsObjIntersectList(x))
            || (!x.IsList && a.Any(y => y.IsList && y.IsValueInList(x.Value.HasValue ? x.Value.Value : 0))) || a.Contains(x)))
                || a.Any(x => (x.IsList && b.Any(y => y.IsList && y.IsObjIntersectList(x))
            || (!x.IsList && b.Any(y => y.IsList && y.IsValueInList(x.Value.HasValue ? x.Value.Value : 0))) || b.Contains(x)));
        }
        public static List<ProdStrNo> GetListProdStrNo(string value)
        {
            var listItem = string.IsNullOrEmpty(value)
                ? new List<string>()
                : value.Split(", ").ToList();
            var listProductNo = new List<ProdStrNo>();
            foreach (var item in listItem)
            {
                var prodStrNo = new ProdStrNo(item);
                listProductNo.Add(prodStrNo);
            }
            return listProductNo;
        }
        public static int SumQuantity(this List<ProdStrNo> list)
        {
            return list.Count > 0 ? list.Sum(x => x.Count()) : 0;
        }
        public static string ToFlatString(this List<ProdStrNo> list)
        {
            var listProductNo = new List<string>();
            if (list != null)
            {
                foreach (var item in list)
                {
                    listProductNo.Add(item.ToString());
                }
            }
            Console.WriteLine("OK");
            return string.Join(", ", listProductNo);
        }
        public static List<int> ToFlatInt(this List<ProdStrNo> list)
        {
            var listProductNo = new List<int>();
            if (list != null)
            {
                foreach (var item in list)
                {
                    if (!item.IsList)
                    {
                        listProductNo.Add(item.Value ?? -1);
                    }
                    else if (item.StartNo.HasValue)
                    {
                        listProductNo.AddRange(Enumerable.Range(item.StartNo.Value, item.Count()));
                    }
                }
            }
            return listProductNo;
        }
        public static List<ProdStrNo> ExtractQuantity(this List<ProdStrNo> list, int quantity)
        {
            var quantitySum = 0;
            var quantityRem = quantity;
            var listProdNo = new List<ProdStrNo>();
            foreach (var item in list)
            {
                if (quantityRem < item.Count())
                {
                    // (1) quantityRem == 0 break
                    // (2) quantityRem == 1 and item is single is not possible, so it run into else and run into (1)
                    // (3) quantityRem >= 1 and item must be a list, extract value in case quantityRem = 1 (3.1), or extract quantityRem from the start (3.2)
                    if (quantityRem == 0)
                    {
                        break;
                    }
                    if (quantityRem == 1 && item.IsList)
                    {
                        var extractingObj = new ProdStrNo(item.StartNo.Value);
                        listProdNo.Add(extractingObj);
                        break;
                    }
                    else if (quantityRem > 1 && item.IsList)
                    {
                        var extractingObj = new ProdStrNo(item.StartNo.Value, item.StartNo.Value + (int)quantityRem - 1);
                        listProdNo.Add(extractingObj);
                        break;
                    }
                }
                else
                {
                    listProdNo.Add(item);
                    quantitySum += item.Count();
                    quantityRem -= item.Count();
                }
            }
            return listProdNo;
        }
        public static List<ProdStrNo> ExtractQuantity(this List<ProdStrNo> list, List<ProdStrNo> listFilter, int quantity)
        {
            var quantitySum = 0;
            var quantityRem = quantity;
            var listProdNo = new List<ProdStrNo>();
            var listCopy = list.ConvertAll(item => new ProdStrNo(item.ToString()));
            listCopy.Extract(listFilter);
            foreach (var item in listCopy)
            {
                if (quantityRem < item.Count())
                {
                    // (1) quantityRem == 0 break
                    // (2) quantityRem == 1 and item is single is not possible, so it run into else and run into (1)
                    // (3) quantityRem >= 1 and item must be a list, extract value in case quantityRem = 1 (3.1), or extract quantityRem from the start (3.2)
                    if (quantityRem == 0)
                    {
                        break;
                    }
                    if (quantityRem == 1 && item.IsList)
                    {
                        var extractingObj = new ProdStrNo(item.StartNo.Value);
                        listProdNo.Add(extractingObj);
                        break;
                    }
                    else if (quantityRem > 1 && item.IsList)
                    {
                        var extractingObj = new ProdStrNo(item.StartNo.Value, item.StartNo.Value + (int)quantityRem - 1);
                        listProdNo.Add(extractingObj);
                        break;
                    }
                }
                else
                {
                    listProdNo.Add(item);
                    quantitySum += item.Count();
                    quantityRem -= item.Count();
                }
            }
            return listProdNo;
        }
        public static List<TProductWithPostion> GetPositionFromCode<TProductWithPostion>(this List<TProductWithPostion> list,
            List<PAreaCategoryStore> listCategory)
            where TProductWithPostion : class, IProductWithPosition
        {
            foreach (var item in list)
            {
                var listPCategoryCode = GetListPCategory(item.MappingCode);
                string[] map = new[] { "AREA", "FLOOR", "LINE", "RACK", "POSITION" };
                var orderedList = (from a in listPCategoryCode.Select((x, i) => new { Index = i, Value = x })
                    join b in map.Select((x, i) => new { Index = i, Value = x }) on a.Index equals b.Index
                    join c in listCategory on new { Code = a.Value, Type = b.Value} equals new { Code = c.PAreaCode, Type = c.PAreaType}
                    select new PCategory
                    {
                        Type = c.PAreaType,
                        Name = c.PAreaDescription
                    }).ToList();

            }
            return list;
        }
        public static string JoinPCategory(List<PCategory> pCategories)
        {
            var result = "";
            var itemArea = pCategories.FirstOrDefault(x => x.Type == "AREA");
            var nameArea = itemArea.Name.Replace("Kho ", "");
            result += $"Kho ${nameArea}";
            var itemFloor = pCategories.FirstOrDefault(x => x.Type == "FLOOR");
            var nameFloor = itemFloor.Name.Replace("Tầng ", "");
            result += $" Tầng ${nameFloor}";
            var itemLine = pCategories.FirstOrDefault(x => x.Type == "LINE");
            var nameLine = itemLine.Name.Replace("Dãy ", "");
            result += $" Dãy ${nameFloor}";
            var itemRack = pCategories.FirstOrDefault(x => x.Type == "RACK");
            var nameRack = itemFloor.Name.Replace("Kệ ", "");
            result += $" Kệ ${nameFloor}";
            var itemPosition = pCategories.FirstOrDefault(x => x.Type == "POSITION");
            var namePosition = itemFloor.Name.Replace("Vị trí ", "");
            result += $" Vị trí ${nameFloor}";
            return result;
        }
        public static List<string> GetListPCategory(string item)
        {
            var list = new List<string>();
            string pat = @"A_(\w+)";
            //string pat = @"A_(\w+)(_F_)?(\w+)?(_L_)?(\w+)?(_R_)?(\w+)?(_P_)?(\w+)?";
            //Instantiate the regular expression object.
            Regex r = new Regex(pat, RegexOptions.IgnoreCase);
            //Match the regular expression pattern against a text string.
            Match m = r.Match(item);
            var nextString = "";
            if (m.Success)
            {
                Group g = m.Groups[1];
                nextString = g.ToString();
            }
            else
            {
                return list;
            }
            string pat1 = @"(\w+)(_F_)(\w+)";
            Regex r1 = new Regex(pat1, RegexOptions.IgnoreCase);
            Match m1 = r1.Match(nextString);
            if (m1.Success)
            {
                Group g1 = m1.Groups[1];
                Group g3 = m1.Groups[3];
                list.Add(g1.ToString());
                nextString = g3.ToString();
            }
            else
            {
                return list;
            }
            string pat2 = @"(\w+)(_L_)(\w+)";
            Regex r2 = new Regex(pat2, RegexOptions.IgnoreCase);
            Match m2 = r2.Match(nextString);
            if (m2.Success)
            {
                Group g1 = m2.Groups[1];
                Group g3 = m2.Groups[3];
                list.Add(g1.ToString());
                nextString = g3.ToString();
            }
            else
            {
                return list;
            }
            string pat3 = @"(\w+)(_R_)(\w+)";
            Regex r3 = new Regex(pat3, RegexOptions.IgnoreCase);
            Match m3 = r3.Match(nextString);
            if (m3.Success)
            {
                Group g1 = m3.Groups[1];
                Group g3 = m3.Groups[3];
                list.Add(g1.ToString());
                nextString = g3.ToString();
            }
            else
            {
                return list;
            }
            string pat4 = @"(\w+)(_P_)(\w+)";
            Regex r4 = new Regex(pat4, RegexOptions.IgnoreCase);
            Match m4 = r4.Match(nextString);
            if (m4.Success)
            {
                Group g1 = m4.Groups[1];
                Group g3 = m4.Groups[3];
                list.Add(g1.ToString());
                list.Add(g3.ToString());
            }
            else
            {
                list.Add(nextString);
            }
            return list;
        }

        public static IEnumerable<ProductGroupType> GetProductGroupTypes()
        {
            return new List<ProductGroupType>
            {
                new ProductGroupType
                {
                    Code = "STATIC_TANK",
                    Name = "Bồn chứa",
                },
                new ProductGroupType
                {
                    Code = "BOTTLE",
                    Name = "Vỏ",
                },
                new ProductGroupType
                {
                    Code = "FUEL",
                    Name = "Dung môi",
                },
                new ProductGroupType
                {
                    Code = "OTHER",
                    Name = "Khác",
                },
            };
        }
        public static IEnumerable<ProductGroupType> GetProductGroupImpExp()
        {
            return new List<ProductGroupType>
            {
                new ProductGroupType
                {
                    Code = "STATIC_TANK",
                    Name = "Bồn chứa",
                    SearchCode = "STATIC_TANK"
                },
                new ProductGroupType
                {
                    Code = "BOTTLE_FUEL",
                    Name = "Bình khí",
                    SearchCode = "BOTTLE"
                },
                new ProductGroupType
                {
                    Code = "BOTTLE_EMPTY",
                    Name = "Vỏ bình",
                    SearchCode = "BOTTLE"
                },
                new ProductGroupType
                {
                    Code = "OTHER",
                    Name = "Vật tư",
                    SearchCode = "OTHER"
                },
            };
        }
    }
    public class PCategory
    {
        public string Name {get; set;}
        public string Type {get; set;}
    }
    public interface IProductWithPosition
    {
        string MappingCode { get; set; }
        string Position { get; set; }
    }
}
