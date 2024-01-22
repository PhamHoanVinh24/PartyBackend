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
    [Table("PRODUCT_LOCATED_MAPPING")]
    public class ProductLocatedMapping
    {
        public ProductLocatedMapping()
        {
            ListCoil = new List<ProdPackageInfoCustom>();
            ListLogs = new List<ProductEntityLog>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? IdImpProduct { get; set; }
        [NotMapped]
        public int? IdProdInStock { get; set; }

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
        public MaterialProduct Product { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletionToken { get; set; }

        public decimal? Quantity { get; set; }

        public decimal? Weight { get; set; }
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
            get
            {
                var listProductNo = new List<string>();
                if (ListProdStrNo != null)
                {
                    foreach (var item in ListProdStrNo)
                    {
                        listProductNo.Add(item.ToString()); 
                    }
                }
                return string.Join(", ", listProductNo);
            }
            set
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
                ListProdStrNo = listProductNo;
            }
        }
        [NotMapped]
        public List<int> ListProductNo { get; set; }
        [NotMapped]
        public List<ProdStrNo> ListProdStrNo { get; set; }
        [NotMapped]
        public int? StartNo { get; set; }
        [NotMapped]
        public int? EndNo { get; set; }
        [NotMapped]
        public bool? InStock { get; set; }
        public string ProdCustomJson { get; set; }
        public bool? IsCustomized { get; set; }
        public string GattrCode { get; set; }
        public string Status { get; set; }
        [NotMapped] //For Updating Mapping
        public string OldMappingCode { get; set; }
    }

    public class ProductCrudMapping
    {
        public int? Id { get; set; }
        public int? IdImpProduct { get; set; }
        public int? IdProdInStock { get; set; }
        public bool? MoveStock { get; set; }
        public string Ordering { get; set; }

        public string MappingCode { get; set; }
        public string MappingLog { get; set; }
        public string ProductNoLog { get; set; }
        public string ProductQrCode { get; set; }

        public string ProductCode { get; set; }
        public decimal? Quantity { get; set; }
        public string Unit { get; set; }
        public string TicketImpCode { get; set; }
        public string WHS_Code { get; set; }
        public string FloorCode { get; set; }
        public string LineCode { get; set; }
        public string RackCode { get; set; }
        public string RackPosition { get; set; }
        public string PositionInStore { get; set; }
        public string TicketCode { get; set; }
        public decimal? Remain { get; set; }
        public decimal? Size { get; set; }
        public string UnitCode { get; set; }
        public string ProductType { get; set; }
        public string PackType { get; set; }
        public string ProductNo { get; set; }
        public string GattrCode { get; set; }
        public string Status { get; set; }
        [NotMapped] //For Updating Mapping
        public string OldMappingCode { get; set; }
        public int? ParentMappingId { get; set; }
        public int? ParentProductNumber { get; set; }
        public string ParentCustomJson { get; set; }
        public string ParentFlatCode { get; set; }
        public string CreatedBy { get; set; }
    }
}
