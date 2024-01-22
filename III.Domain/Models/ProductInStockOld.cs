using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using III.Domain.Common;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_IN_STOCK_OLD")]
    public class ProductInStockOld
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string LotProductCode { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(50)]
        public string StoreCode { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }

        public bool MarkWholeProduct { get; set; }
        public string PackCode { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public string AttrCustom { get; set; }
        public string ProductNo
        {
            get;
            //{
            //    var listProductNo = new List<string>();
            //    if (ListProductNo != null)
            //    {
            //        var groups = ListProductNo.GroupConsecutive().ToList();
            //        foreach (var group in groups)
            //        {
            //            var item = group.ToList();
            //            if (item.Count == 1)
            //            {
            //                listProductNo.Add(item[0].ToString());
            //            }
            //            else if (item.Count > 1)
            //            {
            //                var itemString = string.Join("..", new List<string>{item[0].ToString(), item.LastOrDefault().ToString()});
            //                listProductNo.Add(itemString);
            //            }
            //        }
            //    }
            //    return string.Join(", ", listProductNo);
            //}
            set;
            //{
            //    var listItem = string.IsNullOrEmpty(value)
            //        ? new List<string>()
            //        : value.Split(", ").ToList();
            //    var listProductNo = new List<int>();
            //    foreach (var item in listItem)
            //    {
            //        if (item.Contains(".."))
            //        {
            //            var startNo = int.Parse(item.Split("..")[0].Trim());
            //            var endNo = int.Parse(item.Split("..")[1].Trim());
            //            var listItemNo = Enumerable.Range(startNo, endNo).ToList();
            //            listProductNo.AddRange(listItemNo);
            //        }
            //        else
            //        {
            //            listProductNo.Add(int.Parse(item));
            //        }
            //    }
            //    ListProductNo = listProductNo;
            //}
        }
        public string GattrCode { get; set; }
        [NotMapped]
        public List<int> ListProductNo { get; set; }
    }
    public class MaterialProductInStock : MaterialProduct
    {
        public string Title { get; set; }
        public string AttrCustom { get; set; }
        public string StoreCode { get; set; }
        public string ProductQrCode { get; set; }
        public string MappingCode { get; set; }

        public decimal? Max { get; set; }
        public string UnitName { get; set; }
        public int IdMapping { get; set; }
        public int IdImpProduct { get; set; }
        public DateTime? CreatedTimeMapping { get; set; }
        public decimal? Quantity { get; set; }
        public string StatusName { get; set; }

        //public bool IsMapped { get; set; }

        //public decimal? Quantity { get; set; }
        //public string MappingCode { get; set; }
        public string ProductNo { get; set; }
        public int? StockId { get; set; }
        public string StockUnit { get; set; }
        public string GroupType { get; set; }
        public string FuelCode { get; set; }
        public string FuelName { get; set; }
        public decimal? WeightInStock { get; set; }
    }
}
