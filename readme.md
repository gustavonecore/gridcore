GRIDCORE - Simple Ajax grid table
===================
This is a simple Jquery plugin for use an ajax paginated table of results
Install using bower

Author Gustavo Delgado R. gustavo.uach@gmail.com
gustavonecore
-------

    bower install gridcore

- Add restcore.js **after the jquery library**
- Add gridcore.js **after the restcore library**  and it's done, you can play with it ;)

How to use
-------

    grid = new GridCore({
		columns:[
			{name:'code', title:'OT'},
			{name:'description', title:'Detalle'},
			{name:'customer_name', title:'Cliente'},
			{name:'price', title:'Precio'},
			{name:'start_dt', title:'F. Compromiso'},
			{
				actionColumn: true,
				title:'Actions',
				renderer: function(item)
				{
					return '<div class="col-lg-8">' +
								'<div class="col-lg-3">' +
									'<a title="Imprimir" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-default ot-print"><span class="glyphicon glyphicon-print" aria-hidden="true"></span></a>' +
								'</div>' +
								'<div class="col-lg-3">' +
									'<a title="Editar" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-default ot-edit"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></a>' +
								'</div>' +
								'<div class="col-lg-3">' +
									'<a title="Editar" data-code="' + item.code + '" data-id="' + item.id + '" href="javascript:void(0)" class="btn btn-xs btn-danger ot-delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></a>' +
								'</div>' +
							'</div>';
				}
			}
		],
		dataUrl: BASE_URL + 'order',
		height: 450,
		selector: 'oss-ot-grid',
		onRowClick: function(item, grid)
		{
			$.restCore('GET', BASE_URL + 'order/' + item.id, null, function(error, response)
			{
				// do something
			});
		},
		onRowDoubleClick: function(item, grid)
		{
			location.href = BASE_URL + 'order/edit/' + item.id;
		},
		bindActionColumn: function()
		{
			// Print ot
			$('.ot-print').off('click');
			$('.ot-print').on('click', function()
			{
				// print action
			});

			// Edit ot
			$('.ot-edit').off('click');
			$('.ot-edit').on('click', function()
			{
				// edit action
			});

			// Delete ot
			$('.ot-delete').off('click');
			$('.ot-delete').on('click', function()
			{
				// delete action
			});
		}
	});
