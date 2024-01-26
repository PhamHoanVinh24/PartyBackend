using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
	[Table("FAMILY")]
	public class Family
	{
		[Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
		public int Id { get; set; }

		[StringLength(maximumLength: 200)]
		public string PoliticalAttitude { get; set; }

		[StringLength(maximumLength: 50)]
		public string Relation { get; set; }

		[StringLength(maximumLength: 50)]
		public string Class_Composition { get; set; }

		public bool PartyMember { get; set; }

		[StringLength(maximumLength: 20)]
		public string BirthYear { get; set; }

		[StringLength(maximumLength: 20)]
		public string DeathYear { get; set; }

		[StringLength(maximumLength: 50)]
		public string DeathReason { get; set; }

		[StringLength(maximumLength: 50)]
		public string HomeTown { get; set; }

		[StringLength(maximumLength: 50)]
		public string Residence { get; set; }

		[StringLength(maximumLength: 50)]
		public string Job { get; set; }

		[StringLength(maximumLength: 255)]
		public string WorkingProgress { get; set; }

		[StringLength(maximumLength: 50)]
		public string Name { get; set; }

		public string ProfileCode { get; set; }
		public bool IsDeleted {  get; set; }
	}
}
