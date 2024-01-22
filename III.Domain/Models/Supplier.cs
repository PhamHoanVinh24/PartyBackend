using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
	[Table("SUPPLIER")]
	public class Supplier
	{
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int SupID { get; set; }

		[StringLength(100)]
		public string SupCode { get; set; }

		[StringLength(255)]
		public string SupName { get; set; }

		[StringLength(255)]
		public string Address { get; set; }

		[StringLength(100)]
		public string Telephone { get; set; }

		[StringLength(100)]
		public string Mobile { get; set; }

		[StringLength(50)]
		public string TaxCode { get; set; }

		[StringLength(50)]
		public string LotName { get; set; }

        [StringLength(50)]
		public string Status { get; set; }

		public int? UserId { get; set; }

		[StringLength(100)]
		public string Email { get; set; }

		[StringLength(100)]
		public string Website { get; set; }

        [StringLength(50)]
		public string SupGroup { get; set; }

		public string Description { get; set; }

		[StringLength(100)]
		public string Fax { get; set; }

		public bool? Flag { get; set; }

		[StringLength(500)]
		public string GoogleMap { get; set; }

        public string Identification { get; set; }

        [StringLength(255)]
        public string AddressBank { get; set; }

        [StringLength(255)]
        public string AccountBank { get; set; }

        [StringLength(50)]
		public string CreatedBy { get; set; }

		public DateTime? CreatedTime { get; set; }
		[StringLength(50)]
		public string UpdatedBy { get; set; }

		public DateTime? UpdatedTime { get; set; }

		[StringLength(50)]
		public string DeletedBy { get; set; }

		public DateTime? DeletedTime { get; set; }

		public bool IsDeleted { get; set; }

        [StringLength(255)]
        public string CusType { get; set; }

        [StringLength(255)]
        public string Area { get; set; }

        [StringLength(255)]
        public string Group { get; set; }

        [StringLength(255)]
        public string Role { get; set; }

        [StringLength(255)]
        public string IconLevel { get; set; }
        public string ListUserView { get; set; }

    }
}