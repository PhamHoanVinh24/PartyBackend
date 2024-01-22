using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("TRAINING_CERTIFICATED_PASS")]
    public class TrainingCertificatedPass
    {
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }
		[MaxLength(50)]
        public string SchoolName { get; set; }
        [MaxLength(50)]
        public string Major { get; set; }
        [MaxLength(50)]
        public string Class { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        [MaxLength(100)]
        public string Certificate { get; set; }
		public string ProfileCode { get; set; }
        public bool IsDeleted {  get; set; }
	}
}
