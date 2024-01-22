using III.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace ESEIM.Models
{
    [Table("PROD_RECEIVED_DETAIL")]
    public class ProdReceivedDetail
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

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

        public decimal? SalePrice { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public int? TaxRate { get; set; }

        public int? Discount { get; set; }

        public int? Commission { get; set; }

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

        [StringLength(255)]
        public string RackCode { get; set; }
        public decimal QuantityIsSet { get; set; }
        [NotMapped]
        public string ProductCoil { get; set; }
        public string PackType { get; set; }
        public string ProductLot { get; set; }

        public string CusCode { get; set; }
        public string PoSupCode { get; set; }
        public string Section { get; set; }
        public int? QuantityImp { get; set; }

        public bool IsIntact { get; set; }

        public bool MarkWholeProduct { get; set; }

        [NotMapped]
        public string StoreCode { get; set; }
        [NotMapped]
        public string MappingCode { get; set; }
        public string PackCode { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public bool? IsInside { get; set; }
        public string InsideOriginMap { get; set; }
        public string InsideOriginNo { get; set; }
        public string ProdParent { get; set; }
        public string ImpType { get; set; }
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
        [NotMapped]
        public List<int> ListProductNo { get; set; }
    }

    public class MaterialStoreImpGoodsDetailExport
    {
        public int No { get; set; }
        public string ProductName { get; set; }
        public string ProductCode { get; set; }
        public string Unit { get; set; }
        public decimal QuantityPO { get; set; }
        public decimal Quantity { get; set; }
        public decimal? SalePrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
