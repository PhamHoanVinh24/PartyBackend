using ESEIM.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace ESEIM.Utils
{
    public interface ICardJobService
    {
        CardPercentCompleted UpdatePercentParentSubItem(string chkListCode);
        CardPercentCompleted UpdatePercentParentItem(string cardCode);
        CardPercentCompleted UpdatePercentParentCard(string cardCode);
        CardPercentCompleted UpdatePercentParentList(string listCode);
        CardMapping GetJobCardSuggest(string userName);
        decimal GetCompletedBoard(string boardCode, string objCode);
        Tuple<decimal, int> GetPercentJCObject(string objType, string objCode, bool isAllData, bool isBranch, bool isUser, string userName, string listUserBranch, string userId, string department);
        decimal GetPercentObjMobile(string ObjTypeCode, string ObjID);
    }
    public class CardJobService : ICardJobService
    {
        private EIMDBContext _context;

        private readonly IRepositoryService _repositoryService;
        public CardJobService(EIMDBContext context, IRepositoryService repositoryService)
        {
            _context = context;
            _repositoryService = repositoryService;
        }

        public CardPercentCompleted UpdatePercentParentSubItem(string chkListCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var listSubItems = _context.CardSubitemChecks
                    .Where(x => x.ChkListCode == chkListCode && x.Flag == false).ToList();
                var completedSubItem = listSubItems.Count != 0
                        ? (decimal) (listSubItems.Count(x => x.Approve) * 100) /
                          listSubItems.Count
                        : 0;
                var getCheckItem = _context.CardItemChecks.FirstOrDefault(x => x.ChkListCode == chkListCode);
                if (getCheckItem != null)
                {
                    //update Item
                    getCheckItem.Completed = completedSubItem;
                    model.PercentCheckList = completedSubItem;
                    var listItemCheck =
                        _context.CardItemChecks.Where(x => x.CardCode == getCheckItem.CardCode && x.Flag == false).ToList();
                    //_context.CardItemChecks.Load();
                    //_context.SaveChanges();

                    var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == getCheckItem.CardCode && x.IsDeleted == false);
                    if (getCard != null)
                    {
                        //update Card
                        var completedCard = listItemCheck.Sum(x => (x.Completed * x.WeightNum) / 100);

                        model.PercentCard = completedCard;

                        var progressTracking = new ProgressTracking
                        {
                            CardCode = getCard.CardCode,
                            Progress = getCard.Completed,
                            UpdatedBy = ESEIM.AppContext.UserName,
                            UpdatedTime = DateTime.Now
                        };
                        _context.ProgressTrackings.Add(progressTracking);

                        getCard.Completed = completedCard;
                        //_context.WORKOSCards.Load();

                        //update List
                        var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && !x.IsDeleted);
                        if (getList != null)
                        {
                            var cards = _context.WORKOSCards.Where(x => !x.IsDeleted && x.ListCode.Equals(getList.ListCode) && x.Status != "TRASH" && x.Status != "CANCLED").ToList();
                            //var cards = _context.WORKOSCards.Where(x => !x.IsDeleted && x.ListCode.Equals(getList.ListCode) && x.Status != "TRASH" && x.Status != "CANCLED");
                            var countCardNoWn = cards.Count(x => x.WeightNum == 0);
                            var wnNoUsed = 100 - cards.Where(x => x.WeightNum != 0).Sum(x => x.WeightNum);

                            var lstTempCard = new List<TempWNCard>();
                            foreach (var item in cards)
                            {
                                var tempWn = new TempWNCard
                                {
                                    Completed = getCard.CardCode == item.CardCode ? completedCard : item.Completed,
                                    WeightNum = item.WeightNum != 0 ? item.WeightNum : wnNoUsed / countCardNoWn
                                };
                                lstTempCard.Add(tempWn);
                            }

                            var completed = lstTempCard.Sum(x => (x.Completed * x.WeightNum) / 100);
                            getList.Completed = completed;

                            model.PercentList = getList.Completed;
                            //_context.WORKOSLists.Load();

                            var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                            if (getBoard != null)
                            {
                                var getAllListInBoard = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).ToList();
                                var weightNumListUsed = getAllListInBoard.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                                var weightNumListNoUse = 100 - weightNumListUsed;
                                var listNoHasWeighNum = getAllListInBoard.Where(x => x.WeightNum == 0).ToList();
                                var listNoWeighNumTemp = new List<WORKOSList>();
                                listNoWeighNumTemp.AddRange(listNoHasWeighNum);
                                if (listNoHasWeighNum.Any())
                                {
                                    foreach (var item in listNoHasWeighNum)
                                    {
                                        item.WeightNum = weightNumListNoUse / listNoHasWeighNum.Count();
                                    }
                                }
                                getBoard.Completed = getAllListInBoard.Select(x => new
                                {
                                    Completed = (x.Completed * x.WeightNum) / 100
                                }).Sum(n => n.Completed);
                                model.PercentBoard = getBoard.Completed;

                                //gán lại trọng số của list
                                if (listNoWeighNumTemp.Any())
                                {
                                    foreach (var item in listNoWeighNumTemp)
                                    {
                                        item.WeightNum = 0;
                                    }
                                }
                                //_context.SaveChanges();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // ignored
            }

            return model;
        }

        public CardPercentCompleted UpdatePercentParentItem(string cardCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var listItemCheck =
                    _context.CardItemChecks.Where(x => x.CardCode == cardCode && x.Flag == false).ToList();
                var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && x.IsDeleted == false);
                if (getCard != null)
                {
                    //update Card
                    getCard.Completed = listItemCheck.Select(x => new
                    {
                        Completed = (x.Completed * x.WeightNum) / 100
                    }).Sum(x => x.Completed);
                    model.PercentCard = getCard.Completed;
                    var progressTracking = new ProgressTracking
                    {
                        CardCode = getCard.CardCode,
                        Progress = getCard.Completed,
                        UpdatedBy = ESEIM.AppContext.UserName,
                        UpdatedTime = DateTime.Now
                    };
                    _context.ProgressTrackings.Add(progressTracking);

                    //_context.WORKOSCards.Load();

                    //update List
                    var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && x.IsDeleted == false);
                    if (getList != null)
                    {
                        var cards = _context.WORKOSCards.Where(x => !x.IsDeleted && x.ListCode.Equals(getList.ListCode) && x.Status != "TRASH" && x.Status != "CANCLED").ToList();
                        var countCardNoWn = cards.Count(x => x.WeightNum == 0);
                        var wnNoUsed = 100 - cards.Where(x => x.WeightNum != 0).Sum(x => x.WeightNum);

                        var lstTempCard = new List<TempWNCard>();
                        foreach (var item in cards)
                        {
                            var tempWn = new TempWNCard
                            {
                                Completed = item.Completed,
                                WeightNum = item.WeightNum != 0 ? item.WeightNum : wnNoUsed / countCardNoWn
                            };
                            lstTempCard.Add(tempWn);
                        }

                        var completed = lstTempCard.Sum(x => (x.Completed * x.WeightNum) / 100);
                        getList.Completed = completed;

                        model.PercentList = getList.Completed;
                        //_context.WORKOSLists.Load();

                        var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                        if (getBoard != null)
                        {
                            var getAllListInBoard = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).ToList();
                            var weightNumListUsed = getAllListInBoard.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                            var weightNumListNoUse = 100 - weightNumListUsed;
                            var listNoHasWeighNum = getAllListInBoard.Where(x => x.WeightNum == 0).ToList();
                            var listNoWeighNumTemp = new List<WORKOSList>();
                            listNoWeighNumTemp.AddRange(listNoHasWeighNum);
                            if (listNoHasWeighNum.Any())
                            {
                                foreach (var item in listNoHasWeighNum)
                                {
                                    item.WeightNum = weightNumListNoUse / listNoHasWeighNum.Count();
                                }
                            }
                            getBoard.Completed = getAllListInBoard.Select(x => new
                            {
                                Completed = (x.Completed * x.WeightNum) / 100
                            }).Sum(n => n.Completed);
                            model.PercentBoard = getBoard.Completed;

                            //gán lại trọng số của list
                            if (listNoWeighNumTemp.Any())
                            {
                                foreach (var item in listNoWeighNumTemp)
                                {
                                    item.WeightNum = 0;
                                }
                            }
                            //_context.SaveChanges();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // ignored
            }

            return model;
        }

        public CardPercentCompleted UpdatePercentParentCard(string cardCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                var getCard = _context.WORKOSCards.FirstOrDefault(x => x.CardCode == cardCode && x.IsDeleted == false);
                if (getCard != null)
                {
                    //update Card
                    var completedCard = _context.CardItemChecks.Where(x => x.CardCode == cardCode && x.Flag == false).Sum(x => (x.Completed * x.WeightNum) / 100);
                    string[] paramCard = new string[] { "@CardCode", "@Completed" };
                    object[] valCard = new object[] { getCard.CardCode, completedCard };
                    _repositoryService.CallProc("P_UPDATE_COMPLETED_CARD", paramCard, valCard);
                    model.PercentCard = completedCard;
                    getCard.Completed = completedCard;
                    //_context.WORKOSCards.Load();

                    var progressTracking = new ProgressTracking
                    {
                        CardCode = getCard.CardCode,
                        Progress = getCard.Completed,
                        UpdatedBy = ESEIM.AppContext.UserName,
                        UpdatedTime = DateTime.Now
                    };
                    _context.ProgressTrackings.Add(progressTracking);
                    //update List
                    var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == getCard.ListCode && x.IsDeleted == false);
                    if (getList != null)
                    {
                        var cards = _context.WORKOSCards.Where(x => !x.IsDeleted && x.ListCode.Equals(getList.ListCode) && x.Status != "TRASH" && x.Status != "CANCLED").ToList();
                        var countCardNoWn = getCard.WeightNum == 0 ? 1 : 0;
                        countCardNoWn += cards.Count(x => x.WeightNum == 0 && x.CardCode != getCard.CardCode);
                        var wnNoUsed = 100 - cards.Where(x => x.WeightNum != 0 && x.CardCode != getCard.CardCode).Sum(x => x.WeightNum);
                        wnNoUsed -= getCard.WeightNum;

                        var lstTempCard = new List<TempWNCard>();
                        foreach (var item in cards)
                        {
                            var tempWn = new TempWNCard
                            {
                                Completed = getCard.CardCode == item.CardCode ? completedCard : item.Completed,
                                WeightNum = item.WeightNum != 0 ? item.WeightNum : wnNoUsed / countCardNoWn
                            };
                            lstTempCard.Add(tempWn);
                        }

                        var completed = lstTempCard.Sum(x => (x.Completed * x.WeightNum) / 100);
                        getList.Completed = completed;
                        model.PercentList = getList.Completed;
                        //_context.WORKOSLists.Load();
                        var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                        if (getBoard != null)
                        {
                            //getBoard.Completed += getList.Completed;
                            var getAllListInBoard = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).ToList();
                            var weightNumListUsed = getAllListInBoard.Where(x => x.WeightNum > 0).Sum(x => x.WeightNum);
                            var weightNumListNoUse = 100 - weightNumListUsed;
                            var listNoHasWeighNum = getAllListInBoard.Where(x => x.WeightNum == 0).ToList();
                            var listNoWeighNumTemp = new List<WORKOSList>();
                            listNoWeighNumTemp.AddRange(listNoHasWeighNum);
                            if (listNoHasWeighNum.Any())
                            {
                                foreach (var item in listNoHasWeighNum)
                                {
                                    item.WeightNum = weightNumListNoUse / listNoHasWeighNum.Count();
                                }
                            }

                            getBoard.Completed = getAllListInBoard.Select(x => new
                            {
                                Completed = (x.Completed * x.WeightNum) / 100
                            }).Sum(n => n.Completed);
                            model.PercentBoard = getBoard.Completed;
                            //gán lại trọng số của list
                            if (listNoWeighNumTemp.Any())
                            {
                                foreach (var item in listNoWeighNumTemp)
                                {
                                    item.WeightNum = 0;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // ignored
            }

            return model;
        }

        public CardPercentCompleted UpdatePercentParentList(string listCode)
        {
            var model = new CardPercentCompleted { };
            try
            {
                //update List
                var getList = _context.WORKOSLists.FirstOrDefault(x => x.ListCode == listCode && x.IsDeleted == false);
                if (getList != null)
                {
                    //getList.Completed += (getCard.Completed * getList.WeightNum) / 100;
                    getList.Completed = _context.WORKOSCards.Where(x => x.ListCode == listCode && x.IsDeleted == false && x.Status != "TRASH" && x.Status != "CANCLED").Select(x => new
                    {
                        Completed = (x.Completed * x.WeightNum) / 100
                    }).Sum(n => n.Completed);
                    //_context.WORKOSLists.Load();
                    //_context.SaveChanges();

                    var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == getList.BoardCode && x.IsDeleted == false);
                    if (getBoard != null)
                    {
                        //getBoard.Completed += getList.Completed;
                        getBoard.Completed = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).Select(x => new
                        {
                            Completed = (x.Completed * x.WeightNum) / 100
                        }).Sum(n => n.Completed);
                        //_context.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {

            }
            return model;
        }

        public CardMapping GetJobCardSuggest(string userName)
        {
            return _context.CardMappings.Where(x => x.CreatedBy == userName).MaxBy(x => x.CreatedTime);
        }

        public decimal GetCompletedBoard(string boardCode, string objCode)
        {
            //Get board
            var getBoard = _context.WORKOSBoards.FirstOrDefault(x => x.BoardCode == boardCode && !x.IsDeleted);
            getBoard.Completed = 0;
            //Get List in board
            var lists = _context.WORKOSLists.Where(x => x.BoardCode == getBoard.BoardCode && !x.IsDeleted).ToList();
            //Get list has weight num
            var listWeightNum = lists.Where(x => x.WeightNum > 0).ToList();
            //Get list has not weight num
            var listNoWeightNum = lists.Where(x => x.WeightNum == 0).ToList();
            //Caculate weight num no use
            var listWeightNoUse = 100 - (listWeightNum.Sum(x => x.WeightNum));
            //Set weight num to list has not weight num
            if (listNoWeightNum.Any())
            {
                foreach (var list in listNoWeightNum)
                {
                    list.WeightNum = listWeightNoUse / (listNoWeightNum.Count());
                }
            }

            //Iterator lists list
            foreach (var list in lists)
            {
                list.Completed = 0;
                //Get all card in list and belongs to project
                var cards = (from a in _context.WORKOSCards.Where(x => x.ListCode == list.ListCode && !x.IsDeleted && x.Status != "TRASH" && x.Status != "CANCLED")
                             join b in _context.JcObjectIdRelatives.Where(x => x.ObjID == objCode && !x.IsDeleted) on a.CardCode equals b.CardCode
                             select new Wei
                             {
                                 Completed = a.Completed,
                                 WeightNum = a.WeightNum
                             }).ToList();

                //Get card has weight num
                var cardWeightNum = cards.Where(x => x.WeightNum > 0).ToList();
                //Get card has not weight num
                var cardNoWeightNum = cards.Where(x => x.WeightNum == 0).ToList();
                //Caculate weight num no used
                var weightNum = 100 - cardWeightNum.Sum(x => x.WeightNum);
                //Set weight num to card has not weight num
                if (cardNoWeightNum.Any())
                {
                    foreach (var card in cardNoWeightNum)
                    {
                        card.WeightNum = weightNum / cardNoWeightNum.Count();
                    }
                }

                //Caculate completed list
                foreach (var card in cards)
                {
                    list.Completed += ((card.Completed * card.WeightNum) / 100);
                }
                //Caculate completed board
                getBoard.Completed = ((list.Completed * list.WeightNum) / 100);
            }
            return getBoard.Completed;
        }

        public Tuple<decimal, int> GetPercentJCObject(string ObjTypeCode, string ObjID, bool isAllData, bool isBranch, bool isUser, string userName, string listUserBranch, string userId, string department)
        {
            //update List
            decimal percentObject = 0;
            string[] param = new string[] { "@ObjType", "@ObjCode", "@IsAllData", "@IsBranch", "@IsUser", "@UserName", "@ListUserOfBranch", "@UserId", "@DepartmentId" };
            object[] val = new object[] { ObjTypeCode, ObjID, isAllData, isBranch, isUser, userName, listUserBranch, userId, department };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_CAL_JC_PERCENT", param, val);
            var query = CommonUtil.ConvertDataTable<DataCompleteJC>(rs);
            var countCard = 0;
            if (query.Count() > 0)
            {
                foreach (var item in query)
                {
                    if (item.Weight == 0 && item.Completed > 0)
                    {
                        item.Weight = (item.WeightNoUsed / item.NoWeight);
                    }
                }
                percentObject = query.Sum(x => (x.Weight * x.Completed) / 100);
                countCard = query[0].CountCard;
            }
            return new Tuple<decimal, int>(Convert.ToDecimal(String.Format("{0:0.00}", percentObject)), countCard);
        }

        public decimal GetPercentObjMobile(string ObjTypeCode, string ObjID)
        {
            decimal percentObject = 0;
            string[] param = new string[] { "@ObjType", "@ObjCode" };
            object[] val = new object[] { ObjTypeCode, ObjID };
            DataTable rs = _repositoryService.GetDataTableProcedureSql("P_CAL_JC_PERCENT_MOBILE", param, val);
            var query = CommonUtil.ConvertDataTable<DataCompleteJC>(rs);
            if (query.Count() > 0)
            {
                foreach (var item in query)
                {
                    if (item.Weight == 0)
                    {
                        item.Weight = (item.WeightNoUsed / item.NoWeight);
                    }
                }
                percentObject = query.Sum(x => (x.Weight * x.Completed) / 100);
            }
            return Convert.ToDecimal(String.Format("{0:0.00}", percentObject));
        }
    }
    public class CardPercentCompleted
    {
        public decimal PercentCheckList { get; set; }
        public decimal PercentCard { get; set; }
        public decimal PercentList { get; set; }
        public decimal PercentBoard { get; set; }
    }
    public class Wei
    {
        public decimal WeightNum { get; set; }
        public decimal Completed { get; set; }
    }
    public class DataCompleteJC
    {
        public decimal Weight { get; set; }
        public decimal Completed { get; set; }
        public int NoWeight { get; set; }
        public decimal WeightNoUsed { get; set; }
        public int CountCard { get; set; }
    }
    public class WeiJC
    {
        public string CardCode { get; set; }
        public decimal? Weight { get; set; }
    }
    public class TempWNCard
    {
        public decimal WeightNum { get; set; }
        public decimal Completed { get; set; }
    }
}
