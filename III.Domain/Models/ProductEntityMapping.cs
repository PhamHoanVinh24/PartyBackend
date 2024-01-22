using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using III.Domain.Common;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_ENTITY_MAPPING")]
    public class ProductEntityMapping
    {
        public ProductEntityMapping()
        {
            ListCoil = new List<ProdPackageInfoCustom>();
            ListLogs = new List<ProductEntityLog>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }

        public string MappingCode { get; set; }
        public string MappingLog { get; set; }

        [NotMapped]
        public List<ProductEntityLog> ListLogs { get; set; }
        
        [NotMapped]
        public string ProductNoLog
        {
            get => JsonConvert.SerializeObject(ListLogs);
            set =>
                ListLogs = string.IsNullOrEmpty(value)
                    ? new List<ProductEntityLog>()
                    : JsonConvert.DeserializeObject<List<ProductEntityLog>>(value);
        }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public string ProductCode { get; set; }

        public bool IsDeleted { get; set; }

        public decimal? Quantity { get; set; }
        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string TicketImpCode { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

        [NotMapped]
        public List<ProdPackageInfoCustom> ListCoil { get; set; }

        [NotMapped]
        public string PositionInStore { get; set; }
        [NotMapped]
        public string TicketCode { get; set; }
        [NotMapped]
        public decimal? Remain { get; set; }

        [NotMapped]
        public decimal? Size { get; set; }
        [NotMapped]
        public string UnitCode { get; set; }
        [NotMapped]
        public string ProductType { get; set; }
        [NotMapped]
        public string PackType { get; set; }
        [NotMapped]
        public ProductEntityLog EntryLog { get; set; }
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
            //            var count = endNo - startNo - 1;
            //            var listItemNo = Enumerable.Range(startNo, count).ToList();
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
        [NotMapped]
        public int? StartNo { get; set; }
        [NotMapped]
        public int? EndNo { get; set; }
        [NotMapped]
        public bool? InStock { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public string AttrCustom { get; set; }
        [NotMapped] //For Updating Mapping
        public string OldMappingCode { get; set; }
    }

    public class ProductEntityLog
    {
        public string OldProductNo { get; set; }
        public string NewProductNo { get; set; }
        public string ChangedProductNo { get; set; }
        public string ChangedType { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
    }
}
